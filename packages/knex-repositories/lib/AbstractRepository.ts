import { Knex } from 'knex'
import { chunk, copyWithoutUndefined, pickWithoutUndefined } from 'knex-utils'
import { NonUniqueResultError } from './NonUniqueResultError'
import { NoEntityExistsError } from './NoEntityExistsError'
import { doesSupportReturning, doesSupportUpdateOrderBy } from './dbSupportHelper'
import { validateOnlyWhitelistedFieldsSet } from 'knex-utils/dist/lib/objectUtils'

export type SortingParam<FullEntityRow> = {
  column: keyof FullEntityRow & string
  order?: 'desc' | 'asc'
}

export type RepositoryConfig<NewEntityRow, FullEntityRow, UpdatedEntityRow, Filters> = {
  tableName: string
  idColumn: keyof FullEntityRow & string
  defaultOrderBy?: SortingParam<FullEntityRow>[]
  columnsForCreate?: (keyof NewEntityRow & string)[]
  columnsForUpdate?: (keyof UpdatedEntityRow & string)[]
  columnsForFilters?: (keyof Filters & string)[]
  columnsToFetch?: (keyof FullEntityRow & string)[]
  columnsToFetchList?: (keyof FullEntityRow & string)[]
  columnsToFetchDetails?: (keyof FullEntityRow & string)[]
  throwOnInvalidColumns?: boolean
}

export type UpdateParams<FullEntityRow> = {
  timeout?: number
  sorting?: SortingParam<FullEntityRow>[] | null
}

export type CreateBulkParams = {
  chunkSize: number
}

export type GetParams<RowType> = {
  columnsToFetch?: (keyof RowType & string)[]
  sorting?: SortingParam<RowType>[] | null
}

export class AbstractRepository<
  NewEntityRow extends Record<string, any> = any,
  FullEntityRow extends NewEntityRow = any,
  UpdatedEntityRow extends Record<string, any> = Partial<NewEntityRow>,
  Filters extends Record<string, any> = Partial<FullEntityRow>
> {
  protected readonly knex: Knex
  protected readonly tableName: string
  protected readonly columnsToFetch: string[]
  protected readonly columnsToFetchList: string[]
  protected readonly columnsToFetchDetails: string[]
  protected readonly idColumn: string
  protected readonly defaultOrderBy?: SortingParam<FullEntityRow>[]
  private readonly columnsForCreate?: string[]
  private readonly columnsForFilters?: string[]
  private readonly columnsForUpdate?: string[]
  private readonly columnsForCreateSet?: Set<string>
  private readonly columnsForFiltersSet?: Set<string>
  private readonly columnsForUpdateSet?: Set<string>
  private readonly throwOnInvalidColumns?: boolean

  constructor(
    knex: Knex,
    config: RepositoryConfig<NewEntityRow, FullEntityRow, UpdatedEntityRow, Filters>
  ) {
    this.knex = knex

    this.tableName = config.tableName
    this.idColumn = config.idColumn
    this.defaultOrderBy = config.defaultOrderBy
    this.columnsToFetch = config.columnsToFetch || ['*']
    this.columnsToFetchList = config.columnsToFetch ?? config.columnsToFetch ?? ['*']
    this.columnsToFetchDetails = config.columnsToFetch ?? config.columnsToFetch ?? ['*']
    this.columnsForCreate = config.columnsForCreate || undefined
    this.columnsForFilters = config.columnsForFilters || undefined
    this.columnsForUpdate = config.columnsForUpdate || undefined
    this.columnsForCreateSet = this.columnsForCreate ? new Set(this.columnsForCreate) : undefined
    this.columnsForFiltersSet = this.columnsForFilters ? new Set(this.columnsForFilters) : undefined
    this.columnsForUpdateSet = this.columnsForUpdate ? new Set(this.columnsForUpdate) : undefined
    this.throwOnInvalidColumns =
      (config.throwOnInvalidColumns &&
        (this.columnsForCreateSet !== undefined ||
          this.columnsForFiltersSet !== undefined ||
          this.columnsForUpdateSet !== undefined)) ??
      false
  }

  pickWithoutUndefined<T extends object, K extends string | number | symbol>(
    source: T,
    propNames: readonly K[],
    propSet?: Set<string>
  ): Pick<T, Exclude<keyof T, Exclude<keyof T, K>>> {
    if (this.throwOnInvalidColumns && propSet) {
      validateOnlyWhitelistedFieldsSet(source, propSet)
    }
    return pickWithoutUndefined(source, propNames)
  }

  async create(
    newEntityRow: NewEntityRow,
    transactionProvider?: Knex.TransactionProvider
  ): Promise<FullEntityRow> {
    const insertRow = this.columnsForCreate
      ? this.pickWithoutUndefined(newEntityRow, this.columnsForCreate, this.columnsForCreateSet)
      : copyWithoutUndefined(newEntityRow)
    const queryBuilder = await this.getKnexOrTransaction(transactionProvider)

    const insertedRows = await queryBuilder(this.tableName)
      .insert(insertRow)
      .returning(this.columnsToFetch)

    if (!doesSupportReturning(this.knex)) {
      const insertedRow = await this.getById(insertedRows[0], transactionProvider)
      return insertedRow!
    }

    return insertedRows[0]
  }

  async createBulk(
    newEntityRows: NewEntityRow[],
    transactionProvider?: Knex.TransactionProvider,
    params: CreateBulkParams = { chunkSize: 1000 }
  ): Promise<FullEntityRow[]> {
    const insertRows = newEntityRows.map((newEntityRow) =>
      this.columnsForCreate
        ? this.pickWithoutUndefined(newEntityRow, this.columnsForCreate, this.columnsForCreateSet)
        : copyWithoutUndefined(newEntityRow)
    )
    const queryBuilder = await this.getKnexOrTransaction(transactionProvider)

    const chunks = chunk(insertRows, params.chunkSize)

    const insertedRows = []
    for (const rows of chunks) {
      insertedRows.push(
        ...(await queryBuilder(this.tableName).insert(rows).returning(this.columnsToFetch))
      )
    }

    return insertedRows
  }

  async createBulkNoReturning(
    newEntityRows: NewEntityRow[],
    transactionProvider?: Knex.TransactionProvider,
    params: CreateBulkParams = { chunkSize: 1000 }
  ): Promise<void> {
    const insertRows = newEntityRows.map((newEntityRow) =>
      this.columnsForCreate
        ? this.pickWithoutUndefined(newEntityRow, this.columnsForCreate, this.columnsForCreateSet)
        : copyWithoutUndefined(newEntityRow)
    )
    const queryBuilder = await this.getKnexOrTransaction(transactionProvider)

    const chunks = chunk(insertRows, params.chunkSize)

    for (const rows of chunks) {
      await queryBuilder(this.tableName).insert(rows)
    }
  }

  async updateById(
    id: string | number,
    updatedFields: UpdatedEntityRow,
    transactionProvider?: Knex.TransactionProvider,
    updateConfig: UpdateParams<UpdatedEntityRow> = {}
  ): Promise<FullEntityRow | undefined> {
    const updatedColumns = this.columnsForUpdate
      ? this.pickWithoutUndefined(updatedFields, this.columnsForUpdate, this.columnsForUpdateSet)
      : copyWithoutUndefined(updatedFields)
    const queryBuilder = await this.getKnexOrTransaction(transactionProvider)

    const qb = queryBuilder(this.tableName)
      .where({ [this.idColumn]: id })
      .update(updatedColumns)
      .returning(this.columnsToFetch)

    if (updateConfig.timeout) {
      qb.timeout(updateConfig.timeout)
    }

    const updatedUserRows = await qb

    return updatedUserRows[0]
  }

  async updateSingleByCriteria(
    filterCriteria: Filters,
    updatedFields: UpdatedEntityRow,
    transactionProvider?: Knex.TransactionProvider | null
  ): Promise<FullEntityRow> {
    const result = await this.updateByCriteria(filterCriteria, updatedFields, transactionProvider)

    let returningResult
    if (doesSupportReturning(this.knex)) {
      returningResult = result
    } else {
      returningResult = await this.getByCriteria(filterCriteria, transactionProvider, {
        columnsToFetch: this.columnsToFetchDetails,
      })
    }

    if (returningResult.length > 1) {
      throw new NonUniqueResultError('Query updated more than one row', filterCriteria)
    }
    if (returningResult.length === 0) {
      throw new NoEntityExistsError('Query updated no rows', filterCriteria)
    }
    return result[0]
  }

  async updateByCriteria(
    filterCriteria: Filters,
    updatedFields: UpdatedEntityRow,
    transactionProvider?: Knex.TransactionProvider | null,
    updateParams: UpdateParams<UpdatedEntityRow> = {}
  ): Promise<FullEntityRow[]> {
    const updatedColumns = this.columnsForUpdate
      ? this.pickWithoutUndefined(updatedFields, this.columnsForUpdate, this.columnsForUpdateSet)
      : copyWithoutUndefined(updatedFields)
    const filters = this.columnsForFilters
      ? this.pickWithoutUndefined(filterCriteria, this.columnsForFilters, this.columnsForFiltersSet)
      : copyWithoutUndefined(filterCriteria)
    const queryBuilder = await this.getKnexOrTransaction(transactionProvider)

    const qb = queryBuilder(this.tableName)
      .where(filters)
      .update(updatedColumns)
      .returning(this.columnsToFetch)

    const sortParam = updateParams.sorting ?? this.defaultOrderBy
    if (doesSupportUpdateOrderBy(this.knex) && sortParam) {
      qb.orderBy(sortParam)
    }

    const result = await qb
    return result
  }

  async getById(
    id: string | number,
    transactionProvider?: Knex.TransactionProvider | null,
    params: GetParams<FullEntityRow> = {}
  ): Promise<FullEntityRow | undefined> {
    const queryBuilder = await this.getKnexOrTransaction(transactionProvider)
    const result = await queryBuilder(this.tableName)
      .where({ [this.idColumn]: id })
      .select(params.columnsToFetch ?? this.columnsToFetchDetails)
    return result?.[0]
  }

  async getByIdForUpdate(
    id: string | number,
    transactionProvider: Knex.TransactionProvider,
    params: GetParams<FullEntityRow> = {}
  ): Promise<FullEntityRow | undefined> {
    const trx = await transactionProvider()
    const result = await this.knex(this.tableName)
      .transacting(trx)
      .forUpdate()
      .where({ [this.idColumn]: id })
      .select(params.columnsToFetch ?? this.columnsToFetchDetails)
    return result?.[0]
  }

  async getByCriteria(
    filterCriteria?: Filters,
    transactionProvider?: Knex.TransactionProvider | null,
    params: GetParams<FullEntityRow> = {}
  ): Promise<FullEntityRow[]> {
    let filters
    if (filterCriteria && typeof filterCriteria === 'object') {
      filters = this.columnsForFilters
        ? this.pickWithoutUndefined(
            filterCriteria,
            this.columnsForFilters,
            this.columnsForFiltersSet
          )
        : copyWithoutUndefined(filterCriteria)
    } else {
      filters = {}
    }

    const queryBuilder = await this.getKnexOrTransaction(transactionProvider)

    let qb = queryBuilder(this.tableName).select(params.columnsToFetch ?? this.columnsToFetchList)
    qb = typeof filterCriteria === 'string' ? qb.whereRaw(filterCriteria) : qb.where(filters)

    const sortParam = params.sorting ?? this.defaultOrderBy
    if (sortParam) {
      qb.orderBy(sortParam)
    }

    const result = await qb
    return result
  }

  async getByCriteriaForUpdate(
    transactionProvider: Knex.TransactionProvider,
    filterCriteria?: Filters,
    params: GetParams<FullEntityRow> = {}
  ): Promise<FullEntityRow[]> {
    let filters
    if (filterCriteria) {
      filters = this.columnsForFilters
        ? this.pickWithoutUndefined(
            filterCriteria,
            this.columnsForFilters,
            this.columnsForFiltersSet
          )
        : copyWithoutUndefined(filterCriteria)
    } else {
      filters = {}
    }
    const trx = await transactionProvider()

    const qb = this.knex(this.tableName)
      .transacting(trx)
      .forUpdate()
      .select(params.columnsToFetch ?? this.columnsToFetchList)
      .where(filters)

    const sortParam = params.sorting ?? this.defaultOrderBy
    if (sortParam) {
      qb.orderBy(sortParam)
    }

    const result = await qb
    return result
  }

  async getSingleByCriteria(
    filterCriteria: Filters,
    params: GetParams<FullEntityRow> = {}
  ): Promise<FullEntityRow | undefined> {
    const result = await this.getByCriteria(filterCriteria, null, {
      columnsToFetch: params.columnsToFetch ?? this.columnsToFetchDetails,
      sorting: params.sorting,
    })
    if (result.length > 1) {
      throw new NonUniqueResultError('Query resulted more than in a single result', filterCriteria)
    }
    return result[0]
  }

  async deleteById(
    id: string | number,
    transactionProvider?: Knex.TransactionProvider
  ): Promise<void> {
    const queryBuilder = await this.getKnexOrTransaction(transactionProvider)
    await queryBuilder(this.tableName)
      .where({
        [this.idColumn]: id,
      })
      .del()
  }

  async deleteByCriteria(
    filterCriteria: Filters,
    transactionProvider?: Knex.TransactionProvider
  ): Promise<void> {
    const filters = this.columnsForFilters
      ? this.pickWithoutUndefined(filterCriteria, this.columnsForFilters, this.columnsForFiltersSet)
      : copyWithoutUndefined(filterCriteria)

    const queryBuilder = await this.getKnexOrTransaction(transactionProvider)
    await queryBuilder(this.tableName).where(filters).del()
  }

  createTransactionProvider(): Knex.TransactionProvider {
    return this.knex.transactionProvider()
  }

  async commitTransaction(transactionProvider: Knex.TransactionProvider): Promise<void> {
    const trx = await transactionProvider()
    await trx.commit()
  }

  async rollbackTransaction(transactionProvider: Knex.TransactionProvider): Promise<void> {
    const trx = await transactionProvider()
    await trx.rollback()
  }

  async getKnexOrTransaction(transactionProvider?: Knex.TransactionProvider | null): Promise<Knex> {
    return transactionProvider ? await transactionProvider() : this.knex
  }
}
