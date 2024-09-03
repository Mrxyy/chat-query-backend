export async function executeRes(fx: () => any) {
  let result;
  try {
    result = await fx();
  } catch (err) {
    result = { dataValues: err };
  }
  return result;
}

export type OmitModelType = 'UpdatedAt' | 'DeletedAt';
