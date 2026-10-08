import { build } from '../../node_modules/esbuild/lib/main.js';
import path from 'node:path';

await build({
    entryPoints: ['layout.entry.jsx'], outfile: 'layout.subject.mjs', bundle: true,
    platform: 'node', format: 'esm', jsx: 'automatic', external: ['react', 'react/jsx-runtime'],
    banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
    plugins: [{
        name: 'layout-test-fixtures',
        setup(build) {
            build.onResolve({ filter: /react-router-dom|framer-motion|lib\/supabase|\.\/supabase$|components\/AppSidebar|\.\/AppSidebar|\.\/ThemeProvider/ }, () => ({ path: path.resolve('layout.mocks.jsx') }));
        },
    }],
});
