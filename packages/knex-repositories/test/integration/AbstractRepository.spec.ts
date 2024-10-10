import { Knex } from 'knex'
import { doesSupportReturning } from '../../lib/dbSupportHelper'
import { getAllDbs, getKnexForDb } from './helpers/knexInstanceProvider'
import { createUserTable, dropUserTable } from './helpers/tableCreator'
import { isMysql, isPostgreSQL, isSQLite } from './helpers/dbHelpers'
import { createUserRepository, UserRepository } from './repositories/UserRepository'
import { createUserRepositoryLite, UserRepositoryLite } from './repositories/UserRepositoryLite'
import {
  createUserRepositoryStrict,
  UserRepositoryStrict,
} from './repositories/UserRepositoryStrict'

describe('AbstractRepository integration', () => {
  getAllDbs().forEach((db) => {
    describe(db, () => {
      let knex: Knex
      let userRepository: UserRepository
      let userRepositoryLite: UserRepositoryLite
      let userRepositoryStrict: UserRepositoryStrict
      beforeEach(async () => {
        knex = getKnexForDb(db)
        userRepository = createUserRepository(knex)
        userRepositoryLite = createUserRepositoryLite(knex)
        userRepositoryStrict = createUserRepositoryStrict(knex)
        await createUserTable(knex)
      })

      afterEach(async () => {
        await dropUserTable(knex)
        await knex.destroy()
      })

      const USER_1 = {
        name: 'test',
        age: 25,
      }

      const USER_2 = {
        name: 'test2',
        age: 30,
      }

      const USER_3 = {
        name: 'test3',
        age: 44,
      }

      const assertUser1 = {
        userId: expect.any(Number),
        name: 'test',
        age: 25,
      }

      const assertUser2 = {
        userId: expect.any(Number),
        name: 'test2',
        age: 30,
      }

      const assertUser3 = {
        userId: expect.any(Number),
        name: 'test3',
        age: 44,
      }

      describe('create', () => {
        it('creates new user', async () => {
          const result = await userRepository.create(USER_1)

          expect(result).toMatchObject(assertUser1)
        })

        it('creates new user with lite config', async () => {
          const result = await userRepositoryLite.create(USER_1)

          expect(result).toMatchObject(assertUser1)
        })

        it('throws an error on invalid table', async () => {
          await expect(() => userRepositoryStrict.create(USER_1)).rejects.toThrowError(
            /Unsupported field: age/
          )
        })
      })

      describe('createBulk', () => {
        it('creates several new users', async () => {
          if (!doesSupportReturning(knex)) {
            return
          }

          const result = await userRepository.createBulk([USER_1, USER_2], undefined, {
            chunkSize: 10,
          })

          expect(result).toMatchObject([assertUser1, assertUser2])
        })

        it('creates several new users with lite config', async () => {
          if (!doesSupportReturning(knex)) {
            return
          }

          const result = await userRepositoryLite.createBulk([USER_1, USER_2], undefined, {
            chunkSize: 10,
          })

          expect(result).toMatchObject([assertUser1, assertUser2])
        })

        it('creates several new users with chunk size set to 2', async () => {
          if (!doesSupportReturning(knex)) {
            return
          }

          const result = await userRepository.createBulk([USER_1, USER_2, USER_3], undefined, {
            chunkSize: 2,
          })

          expect(result).toMatchObject([assertUser1, assertUser2, assertUser3])
        })
      })

      describe('createBulkNoReturning', () => {
        it('creates several new users without returning values', async () => {
          const result = await userRepository.createBulkNoReturning([USER_1, USER_2])

          expect(result).toBeUndefined()
        })

        it('creates several new users with chunk size set to 2 without returning', async () => {
          const result = await userRepository.createBulkNoReturning(
            [USER_1, USER_2, USER_3],
            undefined,
            {
              chunkSize: 2,
            }
          )

          expect(result).toBeUndefined()
        })
      })

      describe('getByCriteria', () => {
        it('returns users', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          const result = await userRepository.getByCriteria()

          expect(result).toMatchObject([assertUser1, assertUser2])
        })

        it('returns users with lite config', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          const result = await userRepositoryLite.getByCriteria()

          expect(result).toMatchObject([assertUser1, assertUser2])
        })

        it('supports empty filter', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          const result = await userRepository.getByCriteria({})

          expect(result).toMatchObject([assertUser1, assertUser2])
        })

        it('supports sorting', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          const result = await userRepository.getByCriteria({}, null, {
            sorting: [
              {
                column: 'userId',
                order: 'desc',
              },
            ],
          })

          expect(result).toMatchObject([assertUser2, assertUser1])
        })

        it('supports filtering', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          const result = await userRepository.getByCriteria({
            name: 'test',
          })

          expect(result).toMatchObject([assertUser1])
        })

        it('skips unsupported filtering', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          const result = await userRepository.getByCriteria({
            age: 30,
          } as any)

          expect(result).toMatchObject([assertUser1, assertUser2])
        })
      })

      describe('getSingleByCriteria', () => {
        it('returns user', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          const result = await userRepository.getSingleByCriteria({ name: USER_2.name })

          expect(result).toMatchObject(assertUser2)
        })

        it('throws an error if more than one result', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          await expect(userRepository.getSingleByCriteria({})).rejects.toThrow(
            /Query resulted more than in a single result/
          )
        })

        it('can return undefined', async () => {
          const result = await userRepository.getSingleByCriteria({})

          expect(result).toBeUndefined()
        })

        it('supports columns to fetch', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          const result = await userRepository.getSingleByCriteria(
            {
              name: 'test',
            },
            {
              columnsToFetch: ['userId'],
            }
          )

          expect(result).toMatchObject({
            userId: expect.any(Number),
          })
        })

        it('skips unsupported filtering', async () => {
          await userRepository.create({
            ...USER_1,
            age: 25,
          })

          const result = await userRepository.getSingleByCriteria({
            age: 30,
          } as any)

          expect(result).toMatchObject(assertUser1)
        })
      })

      describe('updateById', () => {
        it('updates supported fields', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)
          const users1 = await userRepository.getByCriteria({
            name: 'test',
          })
          const [user1] = users1

          await userRepository.updateById(user1.userId, {
            age: 11,
            name: 'test14',
          })
          const users = await userRepository.getByCriteria({}, null, {
            sorting: [
              {
                column: 'userId',
                order: 'desc',
              },
            ],
          })

          expect(users).toMatchObject([
            assertUser2,
            {
              ...assertUser1,
              age: 11,
              name: 'test',
            },
          ])
        })
      })

      describe('updateByCriteria', () => {
        it('updates supported fields', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          await userRepository.updateByCriteria(
            {
              name: USER_1.name,
            },
            {
              age: 11,
              name: 'test14',
            }
          )
          const users = await userRepository.getByCriteria({}, null, {
            sorting: [
              {
                column: 'userId',
                order: 'desc',
              },
            ],
          })

          expect(users).toMatchObject([
            assertUser2,
            {
              ...assertUser1,
              age: 11,
              name: 'test',
            },
          ])
        })
      })

      describe('updateSingleByCriteria', () => {
        it('updates supported fields', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          await userRepository.updateSingleByCriteria(
            {
              name: USER_1.name,
            },
            {
              age: 11,
              name: 'test14',
            }
          )
          const users = await userRepository.getByCriteria({}, null, {
            sorting: [
              {
                column: 'userId',
                order: 'desc',
              },
            ],
          })

          expect(users).toMatchObject([
            assertUser2,
            {
              ...assertUser1,
              age: 11,
              name: 'test',
            },
          ])
        })

        it('throws an error if too many entities are updated', async () => {
          await userRepository.create({ ...USER_1, name: 'test' })
          await userRepository.create({ ...USER_2, name: 'test' })

          await expect(
            userRepository.updateSingleByCriteria(
              {
                name: 'test',
              },
              {
                age: 11,
                name: 'test14',
              }
            )
          ).rejects.toThrow(/Query updated more than one row/)
        })
        it('throws an error if no entities are updated', async () => {
          await userRepository.create({ ...USER_1 })
          await userRepository.create({ ...USER_2 })

          await expect(
            userRepository.updateSingleByCriteria(
              {
                name: 'testzz',
              },
              {
                age: 11,
                name: 'test14',
              }
            )
          ).rejects.toThrow(/Query updated no rows/)
        })
      })

      describe('deleteById', () => {
        it('deletes user', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)
          const users1 = await userRepository.getByCriteria({
            name: 'test',
          })

          await userRepository.deleteById(users1[0].userId)
          const users2 = await userRepository.getByCriteria()

          expect(users2).toMatchObject([assertUser2])
        })
      })

      describe('deleteByCriteria', () => {
        it('deletes user', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)

          await userRepository.deleteByCriteria({
            name: USER_1.name,
          })
          const users2 = await userRepository.getByCriteria()

          expect(users2).toMatchObject([assertUser2])
        })
      })

      describe('getById', () => {
        it('retrieves user details', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)
          const users1 = await userRepository.getByCriteria({
            name: 'test',
          })
          const [user1] = users1

          const user = await userRepository.getById(user1.userId)
          const assertDates = isSQLite(knex)
            ? {
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              }
            : { createdAt: expect.any(Date), updatedAt: expect.any(Date) }
          expect(user).toMatchObject({
            ...assertUser1,
            ...assertDates,
          })
        })
      })

      describe('getByIdForUpdate', () => {
        it('locks row for update and timeouts', async () => {
          if (!isPostgreSQL(knex) && !isMysql(knex)) {
            return
          }

          expect.assertions(1)
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)
          const users1 = await userRepository.getByCriteria({
            name: 'test',
          })
          const [user1] = users1

          const trxProvider = knex.transactionProvider()
          await userRepository.getByIdForUpdate(user1.userId, trxProvider)

          try {
            await userRepository.updateById(
              user1.userId,
              {
                age: 99,
              },
              undefined,
              { timeout: 100 }
            )
          } catch (err: any) {
            expect(err.message).toEqual(
              'Defined query timeout of 100ms exceeded when running query.'
            )
          } finally {
            await userRepository.rollbackTransaction(trxProvider)
          }
        })

        it('locks row for update and updates in same transaction', async () => {
          if (!isPostgreSQL(knex) && !isMysql(knex)) {
            return
          }

          expect.assertions(1)
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)
          const users1 = await userRepository.getByCriteria({
            name: 'test',
          })
          const [user1] = users1

          const trxProvider = knex.transactionProvider()
          await userRepository.getByIdForUpdate(user1.userId, trxProvider)

          try {
            await userRepository.updateById(
              user1.userId,
              {
                age: 99,
              },
              trxProvider
            )
          } finally {
            await userRepository.commitTransaction(trxProvider)
          }
          const result = await userRepository.getById(user1.userId)
          expect(result!.age).toEqual(99)
        })
      })

      describe('getByCriteriaForUpdate', () => {
        it('locks row for update and timeouts', async () => {
          if (!isPostgreSQL(knex) && !isMysql(knex)) {
            return
          }

          expect.assertions(1)
          await userRepositoryLite.create(USER_1)
          await userRepositoryLite.create(USER_2)
          const users1 = await userRepositoryLite.getByCriteria({
            name: 'test',
          })
          const [user1] = users1

          const trxProvider = knex.transactionProvider()
          await userRepositoryLite.getByCriteriaForUpdate(trxProvider, {
            userId: user1.userId,
          })

          try {
            await userRepositoryLite.updateById(
              user1.userId,
              {
                age: 99,
              },
              undefined,
              { timeout: 100 }
            )
          } catch (err: any) {
            expect(err.message).toEqual(
              'Defined query timeout of 100ms exceeded when running query.'
            )
          } finally {
            await userRepositoryLite.rollbackTransaction(trxProvider)
          }
        })

        it('locks row for update and updates in same transaction', async () => {
          if (!isPostgreSQL(knex) && !isMysql(knex)) {
            return
          }

          expect.assertions(1)
          await userRepositoryLite.create(USER_1)
          await userRepositoryLite.create(USER_2)
          const users1 = await userRepositoryLite.getByCriteria({
            name: 'test',
          })
          const [user1] = users1

          const trxProvider = knex.transactionProvider()
          await userRepositoryLite.getByCriteriaForUpdate(trxProvider, {
            userId: user1.userId,
          })

          try {
            await userRepositoryLite.updateById(
              user1.userId,
              {
                age: 99,
              },
              trxProvider
            )
          } finally {
            await userRepositoryLite.commitTransaction(trxProvider)
          }
          const result = await userRepositoryLite.getById(user1.userId)
          expect(result!.age).toEqual(99)
        })
      })

      describe('rollbackTransaction', () => {
        it('rolls back changes', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)
          const users1 = await userRepository.getByCriteria({
            name: 'test',
          })
          const [user1] = users1

          const trxProvider = userRepository.createTransactionProvider()
          await userRepository.updateById(
            user1.userId,
            {
              age: 11,
              name: 'test14',
            },
            trxProvider
          )
          await userRepository.rollbackTransaction(trxProvider)

          const users = await userRepository.getByCriteria({}, null, {
            sorting: [
              {
                column: 'userId',
                order: 'desc',
              },
            ],
          })

          expect(users).toMatchObject([assertUser2, assertUser1])
        })
      })

      describe('commitTransaction', () => {
        it('commits changes', async () => {
          await userRepository.create(USER_1)
          await userRepository.create(USER_2)
          const users1 = await userRepository.getByCriteria({
            name: 'test',
          })
          const [user1] = users1

          const trxProvider = userRepository.createTransactionProvider()
          await userRepository.updateById(
            user1.userId,
            {
              age: 11,
              name: 'test14',
            },
            trxProvider
          )
          await userRepository.commitTransaction(trxProvider)

          const users = await userRepository.getByCriteria({}, null, {
            sorting: [
              {
                column: 'userId',
                order: 'desc',
              },
            ],
          })

          expect(users).toMatchObject([
            assertUser2,
            {
              ...assertUser1,
              age: 11,
              name: 'test',
            },
          ])
        })
      })
    })
  })
})
