"""
### Instructions:
Your task is to convert a question into a SQL query, given a Mysql database schema.
Adhere to these rules:
- sql语法使用mysql.
- 字段不一定是英文,请不要私自翻译字段名称.

### Input:
Generate a SQL query that answers the question `{question}`.
This query will run on a database whose schema is represented in this string:
CREATE TABLE `qd_dtl_year` (
  `参保地` varchar(255),
  `结算流水号` varchar(255),
  `病案号` varchar(255),
  `机构名称` varchar(255),
  `机构等级` varchar(255),
  `机构等级系数` varchar(255),
  `姓名` varchar(255),
  `出院科室` varchar(255),
  `结算日期` varchar(255),
  `医保类型` varchar(255),
  `实际发生总费用` varchar(255),
  `医保记账费用` varchar(255),
  `年龄` varchar(255),
  `是否死亡病例` varchar(255),
  `住院天数` varchar(255),
  `入院时间` varchar(255),
  `出院时间` varchar(255),
  `病种类型` varchar(255),
  `病种id` varchar(255),
  `病种编码` varchar(255),
  `病种名称` varchar(255),
  `病种分值` varchar(255),
  `疾病严重程度级别` varchar(255),
  `疾病严重程度校正系数` varchar(255),
  `肿瘤严重程度级别` varchar(255),
  `肿瘤严重程度校正系数` varchar(255),
  `年龄级别` varchar(255),
  `年龄校正系数` varchar(255),
  `辅助目录最终系数` varchar(255),
  `是否偏差病例` varchar(255),
  `偏差类型` varchar(255),
  `偏差病例分值` varchar(255),
  `是否特病单议` varchar(255),
  `特病单议评审系数` varchar(255),
  `特病单议分值` varchar(255),
  `所取校正的分值` varchar(255),
  `最终分值` varchar(255),
  `预算单价` varchar(255),
  `分值结算点值` varchar(255),
  `所在病组支付率` varchar(255),
  `所在机构支付率` varchar(255),
  `该病例支付率` varchar(255),
  `主诊断` varchar(255),
  `主诊断编码` varchar(255),
  `次要诊断` varchar(255),
  `次要诊断编码` varchar(255),
  `手术及操作` varchar(255),
  `手术及操作编码` varchar(255)
);

### Response:
Based on your instructions, here is the SQL query I have generated to answer the question `{根据病人的出入院时间计算出病人的住院时长.}`:
```sql
"""