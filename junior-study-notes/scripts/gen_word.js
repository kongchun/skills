/**
 * 生成初中教材知识要点 Word 文档
 * 基于 docx-js (npm: docx)
 * 
 * 用法：node gen_word.js --chapters "D:\...\八年级物理上" --output "D:\...\八年级物理上_知识要点.docx"
 * 
 * 前置：npm install docx (已随 QClaw 安装)
 * 
 * ⚠️ 注意：所有中文引号必须用角括号「」替代，否则 JS 会报 SyntaxError
 */
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, 
        WidthType, AlignmentType, BorderStyle, PageBreak, Footer, Header, TabStopPosition, TabStopType } = require('docx');
const fs = require('fs');
const path = require('path');

// ---- 读取所有 .md 文件 ----
function readChapters(dir) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
    const chapters = [];
    for (const f of files) {
        const content = fs.readFileSync(path.join(dir, f), 'utf-8');
        chapters.push({ filename: f, content });
    }
    return chapters;
}

// ---- Markdown → docx 段落（简化版） ----
function mdToParagraphs(md) {
    const lines = md.split('\n');
    const paragraphs = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            paragraphs.push(new Paragraph({ text: '' }));
            continue;
        }
        
        // H1
        if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
            paragraphs.push(new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun({ text: trimmed.slice(2), bold: true, size: 32 })],
                spacing: { before: 400, after: 200 },
            }));
            continue;
        }
        
        // H2
        if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
            paragraphs.push(new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: trimmed.slice(3), bold: true, size: 28 })],
                spacing: { before: 300, after: 150 },
            }));
            continue;
        }
        
        // H3
        if (trimmed.startsWith('### ')) {
            paragraphs.push(new Paragraph({
                heading: HeadingLevel.HEADING_3,
                children: [new TextRun({ text: trimmed.slice(4), bold: true, size: 24 })],
                spacing: { before: 200, after: 100 },
            }));
            continue;
        }
        
        // Blockquote (⚠️ warning)
        if (trimmed.startsWith('> ')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: trimmed.slice(2), italics: true, color: 'CC0000' })],
                indent: { left: 360 },
                spacing: { before: 100, after: 100 },
            }));
            continue;
        }
        
        // Table row (simplified - pipe separated)
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            // Skip separator rows like |:---|:---|
            if (trimmed.match(/^\|[\s:\-|]+\|$/)) continue;
            const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: cells.join('  |  '), size: 20 })],
                indent: { left: 360 },
            }));
            continue;
        }
        
        // Code block markers
        if (trimmed.startsWith('```')) continue;
        
        // Formula ($$...$$)
        if (trimmed.startsWith('$$')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: trimmed.replace(/\$\$/g, ''), italics: true, size: 22 })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 150, after: 150 },
            }));
            continue;
        }
        
        // Bullet point
        if (trimmed.startsWith('- ')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: trimmed.slice(2), size: 21 })],
                bullet: { level: 0 },
            }));
            continue;
        }
        
        // Numbered list
        if (trimmed.match(/^\d+\.\s/)) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: trimmed, size: 21 })],
                indent: { left: 360 },
            }));
            continue;
        }
        
        // Normal text
        paragraphs.push(new Paragraph({
            children: [new TextRun({ text: trimmed, size: 21 })],
            spacing: { before: 50, after: 50 },
        }));
    }
    
    return paragraphs;
}

// ---- Main ----
async function main() {
    const args = process.argv.slice(2);
    let chaptersDir = '';
    let outputPath = '';
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--chapters') chaptersDir = args[++i];
        if (args[i] === '--output') outputPath = args[++i];
    }
    
    if (!chaptersDir || !outputPath) {
        console.error('Usage: node gen_word.js --chapters <md_dir> --output <docx_path>');
        process.exit(1);
    }
    
    const chapters = readChapters(chaptersDir);
    const allParagraphs = [];
    
    // 封面
    allParagraphs.push(new Paragraph({ text: '' }));
    allParagraphs.push(new Paragraph({
        children: [new TextRun({ text: path.basename(chaptersDir), bold: true, size: 44 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 2000 },
    }));
    allParagraphs.push(new Paragraph({
        children: [new TextRun({ text: '知识要点与学习规划', size: 32 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
    }));
    allParagraphs.push(new Paragraph({
        children: [new TextRun({ text: new Date().toLocaleDateString('zh-CN'), size: 24, color: '888888' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
    }));
    
    // 分页后逐章
    for (const ch of chapters) {
        allParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
        allParagraphs.push(...mdToParagraphs(ch.content));
    }
    
    const doc = new Document({
        sections: [{ children: allParagraphs }],
    });
    
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    console.log(`[OK] ${outputPath}  (${(buffer.length / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);
