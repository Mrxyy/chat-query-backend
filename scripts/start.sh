#!/bin/bash

# 获取机器架构
ARCH=$(uname -m)

if [ "$ARCH" = "x86_64" ]; then
    # 如果架构是 x86_64，执行 script1.sh
    scripts/download-oracle-x86.sh
elif [ "$ARCH" = "aarch64" ]; then
    # 如果架构是 aarch64，执行 script2.sh
    scripts/download-oracle-arm64.sh
fi

pnpm db:auto-migrate
pnpm run-migration
# 执行 Node.js 应用
npm run start:prod
