// 探索chinese-poetry包的数据结构
const fs = require('fs');
const path = require('path');

// 获取包的安装路径
const poetryPackagePath = path.resolve(__dirname, 'node_modules', 'chinese-poetry');

console.log('chinese-poetry包安装路径:', poetryPackagePath);

// 检查内部的chinese-poetry目录
const innerPoetryPath = path.join(poetryPackagePath, 'chinese-poetry');
if (fs.existsSync(innerPoetryPath) && fs.statSync(innerPoetryPath).isDirectory()) {
  console.log('\n=== 诗人数据结构分析 ===');
  // 详细查看诗人信息文件
  const authorsTangPath = path.join(innerPoetryPath, 'json', 'authors.tang.json');
  if (fs.existsSync(authorsTangPath)) {
    const authorsTang = JSON.parse(fs.readFileSync(authorsTangPath, 'utf8'));
    console.log(`唐代诗人总数: ${authorsTang.length}`);
    if (authorsTang.length > 0) {
      console.log('唐代诗人数据字段:', Object.keys(authorsTang[0]));
      console.log('唐代诗人示例:', JSON.stringify(authorsTang[0], null, 2));
    }
  }
  
  const authorsSongPath = path.join(innerPoetryPath, 'json', 'authors.song.json');
  if (fs.existsSync(authorsSongPath)) {
    const authorsSong = JSON.parse(fs.readFileSync(authorsSongPath, 'utf8'));
    console.log(`\n宋代诗人总数: ${authorsSong.length}`);
    if (authorsSong.length > 0) {
      console.log('宋代诗人数据字段:', Object.keys(authorsSong[0]));
      console.log('宋代诗人示例:', JSON.stringify(authorsSong[0], null, 2));
    }
  }
  
  console.log('\n=== 诗歌数据结构分析 ===');
  // 查看JSON目录下的诗歌数据
  const poemSongFile = path.join(innerPoetryPath, 'json', 'poet.song.0.json');
  if (fs.existsSync(poemSongFile)) {
    const poemsSong = JSON.parse(fs.readFileSync(poemSongFile, 'utf8'));
    console.log(`JSON目录-诗歌文件总数: ${poemsSong.length}`);
    if (poemsSong.length > 0) {
      console.log('JSON目录-诗歌数据字段:', Object.keys(poemsSong[0]));
      console.log('JSON目录-诗歌示例:', JSON.stringify(poemsSong[0], null, 2));
    }
  }
  
  // 重点检查tang目录下的诗歌文件以获取更全面的数据样本
  const tangDirPath = path.join(innerPoetryPath, 'tang');
  if (fs.existsSync(tangDirPath) && fs.statSync(tangDirPath).isDirectory()) {
    console.log('\ntang目录下的文件:');
    const tangFiles = fs.readdirSync(tangDirPath);
    console.log(tangFiles.slice(0, 10));
    
    // 分析多个tang目录下的诗歌文件以获取更全面的数据样本
    const tangPoemFiles = tangFiles.filter(file => file.startsWith('poet.tang.') && file.endsWith('.json')).slice(0, 3);
    tangPoemFiles.forEach((tangPoemFile, index) => {
      const filePath = path.join(tangDirPath, tangPoemFile);
      console.log(`\ntang目录诗歌文件 ${index + 1} (${tangPoemFile}) 数据结构:`);
      try {
        const tangPoems = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`诗歌总数: ${tangPoems.length}`);
        if (tangPoems.length > 0) {
          console.log('诗歌数据字段:', Object.keys(tangPoems[0]));
          console.log('诗歌示例:', JSON.stringify(tangPoems[0], null, 2));
          // 分析数据结构特征
          if (tangPoems[0].paragraphs) {
            console.log(`段落数: ${tangPoems[0].paragraphs.length}`);
          }
          if (tangPoems[0].tags) {
            console.log(`标签: ${tangPoems[0].tags.join(', ')}`);
          }
        }
      } catch (error) {
        console.error(`读取文件 ${tangPoemFile} 时出错:`, error.message);
      }
    });
  }
  
  // 检查是否有词数据
  const ciDirPath = path.join(innerPoetryPath, 'ci');
  if (fs.existsSync(ciDirPath) && fs.statSync(ciDirPath).isDirectory()) {
    console.log('\n=== 词数据结构分析 ===');
    const ciFiles = fs.readdirSync(ciDirPath);
    console.log('词目录文件列表:', ciFiles.slice(0, 5));
    
    const firstCiFile = ciFiles.find(file => file.endsWith('.json'));
    if (firstCiFile) {
      const ciFilePath = path.join(ciDirPath, firstCiFile);
      const ciData = JSON.parse(fs.readFileSync(ciFilePath, 'utf8'));
      console.log(`词文件数据结构:`);
      if (Array.isArray(ciData) && ciData.length > 0) {
        console.log('词数据字段:', Object.keys(ciData[0]));
        console.log('词示例:', JSON.stringify(ciData[0], null, 2));
      }
    }
  }
  
  // 统计数据量
  console.log('\n=== 数据量统计 ===');
  const jsonDirPath = path.join(innerPoetryPath, 'json');
  if (fs.existsSync(jsonDirPath)) {
    const jsonFiles = fs.readdirSync(jsonDirPath);
    const poemFiles = jsonFiles.filter(file => file.startsWith('poet.') && file.endsWith('.json'));
    console.log(`诗歌文件总数: ${poemFiles.length}`);
    
    // 检查是否有tag相关数据
    const tagFiles = jsonFiles.filter(file => file.includes('tag'));
    if (tagFiles.length > 0) {
      console.log('标签文件:', tagFiles);
    }
  }
}