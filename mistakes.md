PS C:\Users\sskut\Desktop\Lumi> npm run dev

> lumi-todo@0.0.0 dev
> vite

VITE v5.4.21 ready in 509 ms

➜ Local: http://localhost:5173/
➜ Network: use --host to expose
➜ press h + enter to show help
10:16:08 [vite] Pre-transform error: Duplicate declaration "GoogleLogo"
5 |
6 | // Simple Google logo component

> 7 | const GoogleLogo = () => (

     |       ^^^^^^^^^^

8 | <svg className="w-5 h-5" viewBox="0 0 24 24">
9 | <path
10 | d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
10:16:08 [vite] Internal server error: Duplicate declaration "GoogleLogo"
5 |
6 | // Simple Google logo component

> 7 | const GoogleLogo = () => (

     |       ^^^^^^^^^^

8 | <svg className="w-5 h-5" viewBox="0 0 24 24">
9 | <path
10 | d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
Plugin: vite:react-babel
File: C:/Users/sskut/Desktop/Lumi/src/components/auth/AuthModal.tsx
at File.buildCodeFrameError (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\core\lib\transformation\file\file.js:193:12)
at Scope.checkBlockScopedCollisions (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\scope\index.js:443:27)
at Scope.registerBinding (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\scope\index.js:544:16)
at Scope.registerDeclaration (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\scope\index.js:494:14)
at Object.BlockScoped (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\scope\index.js:282:12)
at Object.newFn (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\visitors.js:205:17)
at NodePath.\_call (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\path\context.js:49:20)
at NodePath.call (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\path\context.js:39:18)
at NodePath.visit (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\path\context.js:88:31)
at TraversalContext.visitQueue (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\context.js:91:16)
at TraversalContext.visitMultiple (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\context.js:62:17)
at TraversalContext.visit (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\context.js:113:19)
at traverseNode (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\traverse-node.js:131:17)
at traverse (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\index.js:53:34)  
 at NodePath.traverse (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\path\index.js:120:24)
at Scope.crawl (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\scope\index.js:715:12)
at Scope.init (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\scope\index.js:679:12)
at NodePath.setScope (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\path\context.js:126:53)
at NodePath.setContext (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\traverse\lib\path\context.js:138:12)
at new File (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\core\lib\transformation\file\file.js:80:8)
at normalizeFile (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\core\lib\transformation\normalize-file.js:98:10)
at normalizeFile.next (<anonymous>)
at run (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\core\lib\transformation\index.js:22:50)
at run.next (<anonymous>)
at transform (C:\Users\sskut\Desktop\Lumi\node_modules\@babel\core\lib\transform.js:22:33)  
 at transform.next (<anonymous>)
at step (C:\Users\sskut\Desktop\Lumi\node_modules\gensync\index.js:261:32)
at C:\Users\sskut\Desktop\Lumi\node_modules\gensync\index.js:273:13
at async.call.result.err.err (C:\Users\sskut\Desktop\Lumi\node_modules\gensync\index.js:223:11)
at C:\Users\sskut\Desktop\Lumi\node_modules\gensync\index.js:189:28
at C:\Users\sskut\Desktop\Lumi\node_modules\@babel\core\lib\gensync-utils\async.js:67:7  
 at C:\Users\sskut\Desktop\Lumi\node_modules\gensync\index.js:113:33
at step (C:\Users\sskut\Desktop\Lumi\node_modules\gensync\index.js:287:14)
at C:\Users\sskut\Desktop\Lumi\node_modules\gensync\index.js:273:13
at async.call.result.err.err (C:\Users\sskut\Desktop\Lumi\node_modules\gensync\index.js:223:11)
