import axios from 'axios';
// cats.e2e-spec.ts

describe('Api Request', () => {
  test('widgets', async () => {
    await axios
      .post('http://localhost:3001/widgets', {
        content: `
import { Card, Link } from '@arco-design/web-react';
const App = () => {
  return (
    <div className="h-full">
      <Card className="h-full" title="自定义组件">
        欢迎使用紫微低代码平台👏
      </Card>
    </div>
  );
};

export default App;
`,
        props: {
          content: '卡片',
        },
        name: {
          en: 'Card',
          zh: '卡片',
        },
        key: 'Card' + Date.now(),
      })
      .then(
        (res) => {
          return Promise.all([
            axios.get('http://localhost:3001/widgets'),
            axios.put('http://localhost:3001/widgets/' + res?.data?.id, {
              content: `

import { Card, Link } from '@arco-design/web-react';
const App = () => {
  return (
    <div className="h-full">
      <Card className="h-full" title="自定义组件">
        欢迎使用紫微低代码平台👏
      </Card>
    </div>
  );
};
export default App;
`,
              props: {
                content: '卡片',
              },
              name: {
                en: 'Card',
                zh: '卡片',
              },
            }),
          ]).then(([r, n]) => {
            return axios.delete(
              'http://localhost:3001/widgets/' + res?.data?.id,
            );
          });
        },
        (e) => {
          throw e;
        },
      )
      .catch((e) => {
        throw e;
      });
  });
});
