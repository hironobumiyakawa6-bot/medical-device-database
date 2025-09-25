import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>医療機器データベース</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="bg-gray-50 min-h-screen">
        <nav class="bg-blue-600 text-white p-4 shadow-md">
          <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-xl font-bold">
              <i class="fas fa-stethoscope mr-2"></i>
              医療機器データベース
            </h1>
            <div class="space-x-4">
              <a href="/" class="hover:text-blue-200 transition-colors">機器一覧</a>
              <a href="/add" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors">
                <i class="fas fa-plus mr-1"></i>機器追加
              </a>
            </div>
          </div>
        </nav>
        
        <main class="container mx-auto p-6">
          {children}
        </main>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
