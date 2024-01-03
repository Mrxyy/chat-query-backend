import { createFunction } from '@vercel/fun';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('Functions-node', () => {
  test('hello-world', async () => {
    await main().catch(console.error);
  });
});

/**
 * 在指定目录创建或覆盖文件
 * @param {string} directory - 要创建文件的目录
 * @param {string} id - 文件的ID，也用作文件名
 * @param {string} content - 要写入文件的内容
 */
function createOrOverwriteFile(
  id,
  content,
  directory = __dirname + '/example',
) {
  // 确保目录路径存在
  mkdirSync(directory, { recursive: true });

  // 构造文件的完整路径
  const filePath = join(directory, id);

  // 写入文件，如果文件已存在则覆盖
  writeFileSync(filePath, content);
}

async function main() {
  // Starts up the necessary server to be able to invoke the function
  createOrOverwriteFile(
    'test.js',
    `// example/index.js
exports.handler = function (event, context, callback) {
  callback(null, { hello: 'world' });
};`,
  );
  const fn = await createFunction({
    Code: {
      // `ZipFile` works, or an already unzipped directory may be specified
      Directory: __dirname + '/example',
    },
    Handler: `${'test'}.handler`,
    Runtime: 'nodejs',
    Environment: {
      Variables: {
        HELLO: 'world',
      },
    },
    MemorySize: 512,
  });

  // Invoke the function with a custom payload. A new instance of the function
  // will be initialized if there is not an available one ready to process.
  const res = await fn({ hello: 'world' });
  expect(res).toEqual({ hello: 'world' });
  // Prints: { hello: 'world' }

  // Once we are done with the function, destroy it so that the processes are
  // cleaned up, and the API server is shut down (useful for hot-reloading).
  await fn.destroy();
}
