from http.server import SimpleHTTPRequestHandler, HTTPServer

class MyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/public/index.html'
        return SimpleHTTPRequestHandler.do_GET(self)

if __name__ == '__main__':
    server_address = ('', 3000)
    httpd = HTTPServer(server_address, MyHandler)
    print('Server is running on port 3000')
    httpd.serve_forever()