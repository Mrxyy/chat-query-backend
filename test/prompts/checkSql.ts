import { GET_CHECK_RESULT } from 'src/utils/prompts/checkSql';

async function test() {
  const result = await GET_CHECK_RESULT.call({
    messageList: `[
{
"role": "system",
"content": "IMPRTANT: You are a virtual assistant powered by the gpt-3.5-turbo model, now time is 2023/5/30 16:57:14}"
},
{
"role": "user",
"content": "作为一个数据库模型业务分析专家，您需要根据当前数据库模型(DBML格式)生成对应的 MySQL 数据库可执行的 SQL 文本，并列出执行该 SQL 所需的变量及其解释，最后为此条查询命名。当前数据库模型为：\n\ndbml\nTable "orders" {\n "id" int [pk, increment]\n "patient_id" int\n "doctor_id" int\n "appointment_date" timestamp\n "status" varchar\n}\n\nTable "doctors" {\n "id" int [pk, increment]\n "department_id" int\n "name" varchar\n "specialization" varchar\n "phone_number" varchar\n "email" varchar\n}\n\nTable "patients" {\n "id" int [pk, increment]\n "name" varchar\n "gender" varchar\n "age" int\n "phone_number" varchar\n "email" varchar\n "address" varchar\n}\n\nTable "departments" {\n "id" int [pk, increment]\n "hospital_id" int\n "name" varchar\n "description" varchar\n}\n\nTable "hospitals" {\n "id" int [pk, increment]\n "name" varchar\n "address" varchar\n "phone_number" varchar\n "created_at" timestamp\n}\n\nRef:"doctors"."id" < "orders"."doctor_id"\n\nRef:"patients"."id" < "orders"."patient_id"\n\nRef:"hospitals"."id" < "departments"."hospital_id"\n\nRef:"departments"."id" < "doctors"."department_id"\n\n\n\n请按照需求生成结果之后,将结果按照xml语法,将模版中的标签中的内容进行分析(需要用户填入的信息作为变量，如果需要变量:变量的命名必须请放在
和
和之间,例如：
�
�
�
tab、
�
�
�
�
name...)。：\n\n根据您提供的数据库模型，已为您生成查询:\n<sql>按照需要生产的sql语句</sql>\n\n执行所需变量:\n\n判断解决当前问题的查询执行时是否需要变量。若不需要变量，则无需提供任何信息。 若条件成立,请使用：\n<var>
执行
�
�
�
所需变量名称
执行SQL所需变量名称</var>: <varDescription>变量解释</varDescription>\n\n查询命名和描述:\n<queryName>查询名称</queryName>\n<queryDescription>查询描述</queryDescription>\n"
},
{
"role": "system",
"content": "你第一步应该思考分析：用户是否指定生成模拟数据，如果有，你还需要生成模拟数据,你第二步应该思考分析：用户需求中是否需要变量(例如：生成模拟数据就不需要变量,因为数据由你生成),如果需要变量:变量的命名必须请放在
和
和之间,例如："variablesArr": [\n {\n "variable": "
�
�
�
�
�
�
�
�
variable",\n "varDescription": "这个变量的描述"\n }):\n "
},
{
"role": "assistant",
"content": "好的，我明白了。请问你的业务是什么?"
},
{
"role": "user",
"content": "分析数据库，添加一批中文的模拟数据10-15条"
},
{
"role": "assistant",
"content": "",
"function_call": {
"name": "saveExecuteSqlInfo",
"arguments": "{\n "simulation": true,\n "sql": "INSERT INTO orders (patient_id, doctor_id, appointment_date, status) VALUES (1, 1, '2023-05-30 10:00:00', '待确认'), (2, 2, '2023-05-31 14:30:00', '已确认'), (3, 3, '2023-06-01 09:15:00', '已取消'), (4, 4, '2023-06-02 16:45:00', '已完成'), (5, 5, '2023-06-03 11:30:00', '待确认'), (6, 6, '2023-06-04 13:00:00', '已确认'), (7, 7, '2023-06-05 15:45:00', '已取消'), (8, 8, '2023-06-06 10:30:00', '已完成'), (9, 9, '2023-06-07 12:15:00', '待确认'), (10, 10, '2023-06-08 14:00:00', '已确认')",\n "queryName": "添加模拟数据",\n "queryDescription": "向订单表中添加10条模拟数据"\n}"
}
}
]`,
  });
  console.log(result, 'result');
}

describe('checkSql', () => {
  test();
});
