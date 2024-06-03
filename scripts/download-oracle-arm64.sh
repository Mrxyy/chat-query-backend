#!/bin/bash

# 设置环境变量
export LD_LIBRARY_PATH=/opt/oracle/instantclient_19_23

# 更新系统并安装必要的软件
apt-get update
apt-get install -y libpq-dev zlib1g-dev build-essential shared-mime-info libaio1 libaio-dev unzip wget --no-install-recommends

# 下载 Oracle Instant Client 文件
wget https://download.oracle.com/otn_software/linux/instantclient/1923000/instantclient-sdk-linux.arm64-19.23.0.0.0dbru.zip
wget https://download.oracle.com/otn_software/linux/instantclient/1923000/instantclient-sqlplus-linux.arm64-19.23.0.0.0dbru.zip
wget https://download.oracle.com/otn_software/linux/instantclient/1923000/instantclient-basic-linux.arm64-19.23.0.0.0dbru.zip

# 创建目录并解压文件
mkdir -p /opt/oracle
cp instantclient-* /opt/oracle/
cd /opt/oracle/
unzip instantclient-sdk-linux.arm64-19.23.0.0.0dbru.zip
unzip -o instantclient-basic-linux.arm64-19.23.0.0.0dbru.zip
unzip -o instantclient-sqlplus-linux.arm64-19.23.0.0.0dbru.zip

# 清理安装包和临时文件
rm -rf /var/lib/apt/lists/* instantclient-sdk-linux.arm64-19.23.0.0.0dbru.zip instantclient-basic-linux.arm64-19.23.0.0.0dbru.zip instantclient-sqlplus-linux.arm64-19.23.0.0.0dbru.zip
apt -y clean
apt -y remove wget unzip
apt -y autoremove
rm -rf /var/cache/apt

echo "Arm64 Oracle Instant Client installation is complete."
