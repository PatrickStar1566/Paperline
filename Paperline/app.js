const docs={welcome:{title:'欢迎使用 Paperline',content:`# 欢迎使用 Paperline

一款专注于写作的 Markdown 编辑器，把复杂的工具收起来，让文字回到中心。

## 从这里开始

Paperline 将你的文档、想法和灵感放在一个安静的工作区里。你可以直接开始输入，也可以试试左侧工具栏里的格式化按钮。

> 好的工具不会打扰思考，它只在需要的时候出现。

### 让 Markdown 变得简单

- **实时预览**：编辑和阅读之间只差一个点击
- **专注写作**：清爽的纸张阅读区，没有多余装饰
- **随时同步**：你的每一个想法都被妥善保存

\`\`\`js
const idea = "start writing";
console.log(idea);
\`\`\`

准备好了吗？把光标放在这里，开始写下你的下一篇文章。`,date:'最后编辑于今天 10:42',read:'3 分钟阅读'},ideas:{title:'产品想法备忘',content:`# 产品想法备忘

记录那些值得继续思考的瞬间。

## 本周灵感

1. 让新用户在三十秒内完成第一篇文档
2. 为长文档增加更加自然的目录导航
3. 通过专注模式减少视觉噪音

## 下一步

- [ ] 采访三位重度 Markdown 用户
- [x] 完成编辑器原型
- [ ] 设计移动端交互`,date:'最后编辑于昨天 18:26',read:'2 分钟阅读'},travel:{title:'周末旅行清单',content:`# 周末旅行清单

轻装出发，去看一点新的风景。

## 行李

- [x] 充电器与耳机
- [ ] 防晒霜
- [ ] 备用相机电池
- [ ] 轻便外套

## 路线

| 时间 | 计划 |
| --- | --- |
| 周六上午 | 出发，抵达后吃午饭 |
| 周六下午 | 沿河散步 |
| 周日上午 | 逛集市 |

> 不赶时间，才是周末的意义。`,date:'最后编辑于 9 月 7 日 09:18',read:'1 分钟阅读'},archive:{title:'2024 年回顾',content:`# 2024 年回顾

这一年有许多值得记住的片段。

## 关键词

写作、旅行、学习，以及和重要的人保持联系。

---

明年继续保持好奇。`,date:'最后编辑于 2024 年 12 月 31 日',read:'1 分钟阅读'}};
let current='welcome';let currentPath=null;const editor=document.getElementById('editor'),preview=document.getElementById('preview'),outlineItems=document.getElementById('outlineItems'),saveStatus=document.getElementById('saveStatus');
const desktop=window.electronAPI&&window.electronAPI.isElectron;
function fileName(filePath){return String(filePath||'').split(/[\\/]/).pop().replace(/\.(markdown|md)$/i,'')||'未命名文档'}
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1400)}
function addExternalFile(file){const key=`file:${file.filePath}`;if(!docs[key]){docs[key]={title:fileName(file.filePath),content:file.content,date:'最后编辑于刚刚',read:'1 分钟阅读',filePath:file.filePath};const row=document.createElement('button');row.className='file-row';row.dataset.file=key;row.innerHTML='<span class="file-icon">M</span><span class="file-name"></span><span class="file-dot"></span>';row.querySelector('.file-name').textContent=docs[key].title;row.addEventListener('click',()=>load(key));const firstArchive=document.querySelector('.tree-group.muted');document.getElementById('fileTree').insertBefore(row,firstArchive||null)}else{docs[key].content=file.content;docs[key].filePath=file.filePath}currentPath=file.filePath;load(key)}
async function openDesktopFile(){if(!desktop)return;const file=await window.electronAPI.openFile();if(file)addExternalFile(file)}
async function saveDesktopFile(saveAs=false){if(!desktop)return false;saveStatus.textContent='正在保存…';try{const result=await (saveAs?window.electronAPI.saveFileAs:window.electronAPI.saveFile)({filePath:saveAs?null:currentPath,title:docs[current].title,content:editor.value});if(!result){saveStatus.textContent='未保存';return false}currentPath=result.filePath;docs[current].filePath=currentPath;docs[current].title=fileName(currentPath);document.getElementById('docTitle').textContent=docs[current].title;const row=document.querySelector(`.file-row[data-file="${CSS.escape(current)}"] .file-name`);if(row)row.textContent=docs[current].title;saveStatus.textContent='已保存';showToast('已保存 Markdown');return true}catch(error){console.error(error);saveStatus.textContent='保存失败';showToast('保存失败');return false}}
function esc(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function inline(t){return t.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/__([^_]+)__/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/_([^_]+)_/g,'<em>$1</em>').replace(/~~([^~]+)~~/g,'<del>$1</del>')}
function render(md){const a=md.replace(/\r/g,'').split('\n'),o=[],heads=[];let i=0;while(i<a.length){let l=a[i];if(/^```/.test(l)){let code=[],lang=l.slice(3).trim();i++;while(i<a.length&&!/^```/.test(a[i]))code.push(a[i++]);i++;o.push(`<pre><code class="lang-${lang}">${esc(code.join('\n'))}</code></pre>`);continue}if(/^\|/.test(l)&&i+1<a.length&&/^\|?\s*:?-+/.test(a[i+1])){let rows=[l];i+=2;while(i<a.length&&/^\|/.test(a[i]))rows.push(a[i++]);let cells=x=>x.split('|').slice(1,-1).map(c=>c.trim());o.push(`<table><thead><tr>${cells(rows[0]).map(c=>`<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${cells(r).map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);continue}let h=l.match(/^(#{1,3})\s+(.+)/);if(h){let id='h-'+heads.length;heads.push({text:h[2],level:h[1].length,id});o.push(`<h${h[1].length} id="${id}">${inline(h[2])}</h${h[1].length}>`);i++;continue}if(/^---+$/.test(l.trim())){o.push('<hr>');i++;continue}if(/^>\s?/.test(l)){let q=[];while(i<a.length&&/^>\s?/.test(a[i]))q.push(a[i++].replace(/^>\s?/,''));o.push(`<blockquote>${q.map(inline).join('<br>')}</blockquote>`);continue}if(/^\s*[-*+]\s+/.test(l)){let list=[];while(i<a.length&&/^\s*[-*+]\s+/.test(a[i]))list.push(a[i++].replace(/^\s*[-*+]\s+/,''));o.push(`<ul>${list.map(x=>{let t=x.match(/^\[([ xX])\]\s*(.*)/);return t?`<li class="task"><input type="checkbox" ${t[1].toLowerCase()==='x'?'checked':''}>${inline(t[2])}</li>`:`<li>${inline(x)}</li>`}).join('')}</ul>`);continue}if(/^\s*\d+\.\s+/.test(l)){let list=[];while(i<a.length&&/^\s*\d+\.\s+/.test(a[i]))list.push(a[i++].replace(/^\s*\d+\.\s+/,''));o.push(`<ol>${list.map(x=>`<li>${inline(x)}</li>`).join('')}</ol>`);continue}if(!l.trim()){i++;continue}let p=[];while(i<a.length&&a[i].trim()&&!/^(#{1,3})\s|^```|^\s*[-*+]\s+|^\s*\d+\.\s+|^>|^\|/.test(a[i]))p.push(a[i++]);o.push(`<p>${p.map(inline).join('<br>')}</p>`)}return{html:o.join(''),heads}}
function update(){let r=render(editor.value);preview.innerHTML=r.html;outlineItems.innerHTML=r.heads.length?r.heads.map(h=>`<button class="outline-item level-${h.level}" data-target="${h.id}">${h.text}</button>`).join(''):'<span class="outline-item">暂无标题</span>';document.getElementById('wordCount').textContent=`${editor.value.trim()?editor.value.trim().split(/\s+/).length:0} 字`;document.getElementById('charCount').textContent=`${editor.value.length} 字符`;document.getElementById('readTime').textContent=`${Math.max(1,Math.ceil(editor.value.length/520))} 分钟阅读`}
function load(key){current=key;let d=docs[key];currentPath=d.filePath||null;editor.value=d.content;document.getElementById('docTitle').textContent=d.title;document.getElementById('docDate').textContent=d.date;document.getElementById('readTime').textContent=d.read;document.querySelectorAll('.file-row').forEach(b=>b.classList.toggle('active',b.dataset.file===key));update();saveStatus.textContent='已保存'}
function dirty(){saveStatus.textContent='正在保存…';clearTimeout(window.saveTimer);window.saveTimer=setTimeout(()=>saveStatus.textContent='已保存',650)}function surround(pre,post=''){let s=editor.selectionStart,e=editor.selectionEnd,v=editor.value,t=v.slice(s,e)||'文本';editor.setRangeText(pre+t+post,s,e,'select');editor.focus();update();dirty()}
document.querySelectorAll('.file-row').forEach(b=>b.addEventListener('click',()=>load(b.dataset.file)));editor.addEventListener('input',()=>{docs[current].content=editor.value;update();dirty()});document.querySelectorAll('.mode-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.mode-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');let p=b.dataset.mode==='preview';editor.classList.toggle('hidden',p);preview.classList.toggle('active',p);document.querySelector('.editor-hint').style.display=p?'none':''}));
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{let a=b.dataset.action,m={bold:['**','**'],italic:['*','*'],strike:['~~','~~'],code:['`','`'],link:['[','](https://)']};if(m[a])surround(...m[a]);else if(a==='h1'||a==='h2')surround(a==='h1'?'# ':'## ');else if(a==='quote')surround('> ');else if(a==='ul')surround('- ');else if(a==='ol')surround('1. ');else if(a==='check')surround('- [ ] ')}));editor.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['b','i'].includes(e.key.toLowerCase())){e.preventDefault();let x=e.key.toLowerCase()==='b'?'**':'*';surround(x,x)}});
document.getElementById('openSidebar').addEventListener('click',()=>document.getElementById('sidebar').classList.add('open'));document.getElementById('closeSidebar').addEventListener('click',()=>document.getElementById('sidebar').classList.remove('open'));document.getElementById('themeToggle').addEventListener('click',()=>{document.body.classList.toggle('dark');document.getElementById('themeToggle').textContent=document.body.classList.contains('dark')?'☾':'☼'});document.getElementById('fileFilter').addEventListener('input',e=>{let q=e.target.value.toLowerCase();document.querySelectorAll('.file-row').forEach(b=>b.style.display=b.innerText.toLowerCase().includes(q)?'flex':'none')});
const modal=document.getElementById('searchModal');document.getElementById('openSearch').addEventListener('click',()=>{modal.classList.add('open');document.getElementById('searchInput').focus()});function closeSearch(){modal.classList.remove('open')}document.getElementById('closeSearch').addEventListener('click',closeSearch);modal.addEventListener('click',e=>{if(e.target===modal)closeSearch()});document.getElementById('searchInput').addEventListener('input',e=>{let q=e.target.value.trim(),box=document.getElementById('searchResults');if(!q){box.textContent='输入关键词开始搜索';return}let re=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),hits=[];docs[current].content.split('\n').forEach((l,i)=>{if(re.test(l)){re.lastIndex=0;hits.push(`<div class="search-hit"><small>第 ${i+1} 行</small><br>${l.replace(re,m=>`<mark>${m}</mark>`)}</div>`)}});box.innerHTML=hits.length?hits.join(''):'没有找到匹配内容'});outlineItems.addEventListener('click',e=>{if(e.target.dataset.target)document.getElementById(e.target.dataset.target)?.scrollIntoView({behavior:'smooth',block:'center'})});
document.getElementById('newFile').addEventListener('click',()=>{let title=prompt('新文档标题','未命名文档');if(!title)return;let key='new-'+Date.now();docs[key]={title,content:`# ${title}\n\n开始记录你的想法。`,date:'最后编辑于刚刚',read:'1 分钟阅读'};let row=document.createElement('button');row.className='file-row';row.dataset.file=key;row.innerHTML='<span class="file-icon">M</span><span class="file-name"></span>';row.querySelector('.file-name').textContent=title;document.getElementById('fileTree').insertBefore(row,document.querySelector('.tree-group.muted'));row.addEventListener('click',()=>load(key));load(key)});
document.getElementById('exportBtn').addEventListener('click',()=>{if(desktop){saveDesktopFile(true);return}let b=new Blob([editor.value],{type:'text/markdown;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=`${docs[current].title}.md`;a.click();URL.revokeObjectURL(u);showToast('已导出 Markdown')});
document.getElementById('saveFileBtn').addEventListener('click',()=>{if(desktop)saveDesktopFile(false);else document.getElementById('exportBtn').click()});
if(desktop){window.electronAPI.onFileOpened(addExternalFile);window.electronAPI.onMenuCommand((command)=>{if(command==='save')saveDesktopFile(false);if(command==='save-as')saveDesktopFile(true)});window.electronAPI.getInitialFile().then((file)=>{if(file)addExternalFile(file)});editor.addEventListener('keydown',(event)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();saveDesktopFile(false)}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='o'){event.preventDefault();openDesktopFile()}})}
document.getElementById('openFileBtn').addEventListener('click',openDesktopFile);
load('welcome');
