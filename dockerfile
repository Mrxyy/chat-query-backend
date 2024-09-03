FROM node:18

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 文件到工作目录
COPY package*.json ./
COPY pnpm-lock.yaml ./

ARG OPEN_AI_API_KEY
ENV OPEN_AI_API_KEY $OPEN_AI_API_KEY

ARG MODEL_NAME
ENV MODEL_NAME $MODEL_NAME

ARG BASE_URL
ENV BASE_URL $BASE_URL

ARG DB_HOST
ENV DB_HOST $DB_HOST

ARG DB_PORT
ENV DB_PORT $DB_PORT

ARG DB_PASSWORD
ENV DB_PASSWORD $DB_PASSWORD

ARG DB_USER
ENV DB_USER $DB_USER

# 安装项目依赖
RUN npm i -g pnpm
RUN pnpm i

# 复制应用程序源代码到工作目录
COPY dist ./dist

# 暴露端口，确保与 Nest.js 应用程序中设置的端口一致
EXPOSE 3001

# 启动命令
CMD [ "npm", "run", "start:prod" ]
