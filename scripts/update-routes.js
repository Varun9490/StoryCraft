const fs = require('fs');
const path = require('path');

const dirsToSearch = ['c:/Users/varun/Desktop/StoryCraft/src/app/api'];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('route.js')) results.push(file);
        }
    });
    return results;
}

const files = walk(dirsToSearch[0]);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Ignore files already handled like auth/register/route.js
    if (content.includes('sanitizeBody')) return;

    let isAuth = file.includes('\\auth\\') || file.includes('/auth/');
    let isUpload = file.includes('\\upload\\') || file.includes('/upload/');
    let isAi = file.includes('\\ai\\') || file.includes('/ai/');
    let limiter = 'apiLimiter';
    if (isAuth) limiter = 'authLimiter';
    if (isUpload) limiter = 'uploadLimiter';
    if (isAi) limiter = 'aiLimiter';

    const regex = /export\s+async\s+function\s+(POST|PUT|DELETE)\s*\((.*?)\)\s*\{/g;
    let match;
    let modified = false;

    while ((match = regex.exec(originalContent)) !== null) {
        const method = match[1];
        const paramStr = match[2];
        const reqVarMatch = paramStr.match(/([a-zA-Z0-9_]+)/);
        const reqVar = reqVarMatch ? reqVarMatch[1] : 'req';

        const importStatement = `import { ${limiter} } from '@/lib/rate-limit';\nimport { sanitizeBody } from '@/lib/sanitize';\n`;
        const injection = `\n        const limit = ${limiter}(${reqVar});\n        if (!limit.allowed) {\n            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });\n        }\n\n        const rawBody = await ${reqVar}.json();\n        const body = sanitizeBody(rawBody);\n`;

        // We replace "export async function POST(req) { \n  try {" 
        // Or "export async function POST(req) {"
        const searchRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(${paramStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)\\s*\\{`);

        let hasTry = false;
        let trySearchRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(${paramStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)\\s*\\{\\s*try\\s*\\{`);
        let tryMatch = originalContent.match(trySearchRegex);

        let injectWhereRegex = tryMatch ? trySearchRegex : searchRegex;

        content = content.replace(injectWhereRegex, (m) => {
            return m + injection;
        });

        // Also replace req.json() to body
        const reqJsonRegex = new RegExp(`const\\s+(.*?)\\s*=\\s*await\\s+${reqVar}\\.json\\(\\);`, 'g');
        content = content.replace(reqJsonRegex, 'const $1 = body;');

        // Add imports inside the file
        if (!content.includes('sanitizeBody from')) {
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfLine = content.indexOf('\n', lastImportIndex);
                content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
            } else {
                content = importStatement + content;
            }
        }

        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content);
        console.log('Modified', file);
    }
});
