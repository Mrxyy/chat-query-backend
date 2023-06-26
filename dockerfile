FROM node:18

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 文件到工作目录
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY .env ./

# 安装项目依赖
RUN npm i -g pnpm
RUN npm i

# 复制应用程序源代码到工作目录
COPY dist ./dist

# 暴露端口，确保与 Nest.js 应用程序中设置的端口一致
EXPOSE 3001

# 启动命令
CMD [ "npm", "run", "start:prod" ]