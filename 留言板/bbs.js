const http = require('http')
const fs = require('fs')
const path = require('path')
const querystring = require('querystring')
const promisify = require('util').promisify
const pug = require('pug')

const readFile = promisify(fs.readFile)

const port = 8989

var globalIdCount = 4

var messages = [
  {
    username: "foo",
    content: "bar",
    timestamp: Date.now(),
    id: 1
  },
  {
    username: "foo1",
    content: "bar1",
    timestamp: Date.now(),
    id: 2
  },
  {
    username: "foo2",
    content: "bar2",
    timestamp: Date.now(),
    id: 3
  }
];

http.createServer(async (req, res) => {
    console.log(req.method, req.url)
    if (req.url === '/') {
        var tplSrc = await readFile(path.join(__dirname, './bbs.pug'))
        var template = pug.compile(tplSrc, {
            pretty: true
        })
        if (req.method === 'GET') {
            res.end(template({
                messages: messages.slice().reverse()
            }))
        } else if (req.method === 'POST') {
            var body = ''
            req.on('data', data => {
                body += data.toString()
            })
            req.on('end', () => {
                var msg = querystring.parse(body)
                msg.timestamp = Date.now()
                msg.id = globalIdCount++
                console.log(msg)
                messages.push(msg)
                // res.end(`
                //     <div id="countdown"></div>
                //     <script>
                //         var second = 20
                //         setInterval(() => {
                //             countdown.innerText = '将会在'+ (second--) + '秒后跳回首页'
                //             if (second === 0) {
                //                 location.href="/"
                //             }
                //         }, 1000)
                //     </script>
                // `);
                res.writeHead(301, {
                    Location: '/'
                })
                res.end()
                // res.end(template({
                //     messages: messages.slice().reverse()
                // }));
            })
        }
    } else if (req.url.startsWith('/delete')) {
        var id = req.url.match(/\/delete\/(\d+)/)[1]
        id = parseInt(id)
        messages = messages.filter(it => it.id !== id)
        res.writeHead(301, {
            Location: '/'
        })
        res.end()
    } else {
        res.writeHead(404)
        res.end('404 not found')
    }
}).listen(port, () => {
    console.log('listening on port', port)
})
