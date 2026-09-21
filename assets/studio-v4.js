/* Local-first UI. No uploads or remote services. */
const pagePresets={A5:[148,210],A4:[210,297],A3:[297,420]};
const clamp=(n,min,max,fallback=min)=>Math.max(min,Math.min(max,Number.isFinite(Number(n))?Number(n):fallback));
function pageConfig(){const c=v().style.page||{kind:'A4',width:210,height:297};const kind=[...Object.keys(pagePresets),'long'].includes(c.kind)?c.kind:'A4';const [width,height]=pagePresets[kind]||[clamp(c.width,100,420,210),0];return{kind,width,height};}
function bodyWidth(){return pageConfig().width-2*v().style.margin;}
function boundPhoto(f){f.width=clamp(f.width,12,Math.min(70,bodyWidth()));f.height=clamp(f.height,16,90);f.x=clamp(f.x,0,Math.max(0,bodyWidth()-f.width));f.y=clamp(f.y,0,70);f.scale=clamp(f.scale,1,5);return f;}
renderHome=function(){
 document.body.dataset.mode='home';document.title='ResuWeave';
 $('#projectHome').innerHTML=`<div class="start-grid"><section class="start-card"><h1>打开现有简历</h1><div class="drop-target" id="openResume" role="button" tabindex="0" aria-label="打开简历项目文件"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 15V9h13l5 6h16v25H7z"/><path d="M7 20h34"/></svg><span>选择文件，或拖到这里</span><small>.resume.json</small></div></section><section class="start-card"><h1>从模板开始创建</h1><div class="start-previews">${['blue','sidebar','ink'].map(id=>{const t=THEMES.find(t=>t.id===id);return`<div class="template-preview preview-${t.id}" style="--swatch:${t.color}"><b></b><i></i><i></i><i></i><i></i><i></i><i></i></div>`}).join('')}</div><button class="primary" id="chooseTemplate">选择模板 →</button></section></div>`;
 const drop=$('#openResume');drop.onclick=()=>openExisting();drop.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();openExisting()}};drop.ondragover=e=>{e.preventDefault();drop.classList.add('drag-over')};drop.ondragleave=()=>drop.classList.remove('drag-over');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('drag-over');if(e.dataTransfer.files[0])importResume(e.dataTransfer.files[0])};$('#chooseTemplate').onclick=chooseTemplate;
};
function openExisting(){$('#projectFileInput').click()}
async function importResume(file){try{if(file.size>30*1024*1024)throw Error('请选择小于 30 MB 的文件');const payload=normalizeProjectFile(JSON.parse(await file.text()),file.name);const p=await addProject(payload.name,payload.data);await showProject(p.id)}catch(e){toast('无法打开：'+e.message)}}
$('#projectFileInput').onchange=e=>{if(e.target.files[0])importResume(e.target.files[0]);e.target.value=''};
function templateSample(t){return`<div class="sample-paper sample-${t.id}" style="--sample-accent:${t.color}"><div class="sample-head"><div><h3>林知夏</h3><p>商业分析 · 市场研究</p><small>lin.zhixia@example.com　上海</small></div><div class="sample-avatar">LX</div></div><section class="sample-section"><h4>教育背景</h4><div class="sample-entry"><header><b>东海商学院</b><span>2022.09 — 2026.06</span></header><p>国际经济与贸易 · GPA 3.82/4.0</p></div></section><section class="sample-section"><h4>实习经历</h4><div class="sample-entry"><header><b>远航咨询｜行业研究实习生</b><span>2025.06 — 2025.09</span></header><ul><li>跟踪海外科技与能源行业，整理日报、周报及专题研究。</li><li>搭建公司与项目数据库，完成市场规模和竞争格局分析。</li></ul></div><div class="sample-entry"><header><b>青禾品牌工作室｜市场实习生</b><span>2024.07 — 2024.10</span></header><ul><li>参与用户访谈、竞品拆解与内容策划，支持品牌活动落地。</li></ul></div></section><section class="sample-section"><h4>项目经历</h4><div class="sample-entry"><header><b>城市公共空间活化研究</b><span>2025</span></header><ul><li>基于问卷和访谈完成用户画像，提出三项可执行的空间运营建议。</li><li>负责数据整理、可视化展示及最终汇报。</li></ul></div></section><section class="sample-section"><h4>技能与证书</h4><p>Excel · PowerPoint · SQL · Python · IELTS 7.0 · 商业分析与行业研究</p></section></div>`}
function chooseTemplate(){openDialog(`<h2>选择模板</h2><div class="template-stack">${THEMES.map(t=>`<article class="template-option"><div class="sample-paper-wrap">${templateSample(t)}</div><div class="template-option-side"><h3>${t.name}</h3><p>${t.desc}</p><button class="primary" data-start-template="${t.id}">使用此模板</button></div></article>`).join('')}</div><div class="dialog-actions"><button data-close>取消</button></div>`);$('#editor').classList.add('template-picker');$('#editor').addEventListener('close',()=>$('#editor').classList.remove('template-picker'),{once:true});$$('[data-start-template]').forEach(b=>b.onclick=()=>{$('#editor').close();createFromTemplate(b.dataset.startTemplate)})}
function createFromTemplate(id){const theme=THEMES.find(t=>t.id===id)||THEMES[0];openDialog(`<h2>${theme.name}</h2><form><div class="form-grid">${field('姓名','owner','',true)}</div><div class="dialog-actions"><button type="button" data-close>取消</button><button class="primary">开始编辑</button></div></form>`,d=>{const name=String(d.get('owner')).trim();const data=blankWorkspace(name,theme);data.versions[0].name='版本 1';addProject((name||'我')+'的简历',data).then(p=>showProject(p.id)).catch(e=>toast(e.message))});$('#editor [name=owner]').focus()}
newProjectDialog=createFromTemplate;
const versionRow=$('#versionSelect').parentElement;versionRow.classList.add('version-actions');$('#versionMenu').textContent='重命名';$('#versionMenu').title='重命名版本';versionRow.append($('#versionMenu'),$('#newVersion'));
$('#versionMenu').onclick=()=>openDialog(`<h2>重命名版本</h2><form><div class="form-grid">${field('版本名称','name',v().name,true)}</div><div class="dialog-actions"><button type="button" data-close>取消</button><button class="primary">保存</button></div></form>`,d=>change(()=>v().name=String(d.get('name')).trim()||v().name));
const baseActions=document.createElement('div');baseActions.className='base-actions top-base-actions';baseActions.innerHTML='<button id="syncBase">同步修改至经历库</button><button id="restoreBase">恢复经历库内容</button>';document.querySelector('header .actions').insertBefore(baseActions,$('#backupBtn'));
function changedEntries(){return Object.keys(v().overrides).filter(id=>state.entries.some(e=>e.id===id)&&JSON.stringify(resolved(state.entries.find(e=>e.id===id)))!==JSON.stringify(state.entries.find(e=>e.id===id)))}
$('#syncBase').onclick=()=>{document.activeElement?.blur();const ids=changedEntries();if(!ids.length)return toast('没有需要同步的经历修改');openDialog(`<h2>同步修改至经历库？</h2><p class="hint">将更新 ${ids.length} 条经历底稿。其他未单独改写的版本也会使用新底稿；勾选、排序与排版不变。</p><div class="dialog-actions"><button data-close>取消</button><button class="primary" id="confirmSync">确认同步</button></div>`);$('#confirmSync').onclick=()=>{change(()=>{ids.forEach(id=>{const i=state.entries.findIndex(e=>e.id===id);state.entries[i]=clone(resolved(state.entries[i]));delete v().overrides[id]})});$('#editor').close();toast('已更新经历库底稿，可撤销')}};
$('#restoreBase').onclick=()=>{document.activeElement?.blur();if(!Object.keys(v().overrides).length)return toast('当前经历与底稿一致');openDialog('<h2>恢复经历库内容？</h2><p class="hint">清除当前版本的经历改写，使用最新底稿。勾选、排序、个人信息与排版不变。</p><div class="dialog-actions"><button data-close>取消</button><button class="primary" id="confirmRestore">确认恢复</button></div>');$('#confirmRestore').onclick=()=>{change(()=>v().overrides={});$('#editor').close();toast('已恢复底稿，可撤销')}};
function editModule(id){
 const sec=state.sections.find(s=>s.id===id);if(!sec)return;
 const count=state.entries.filter(e=>e.section===id).length;
 const currentName=v().sectionNames[id]?.[lang()]||text(sec.name)||sec.name.zh;
 const moduleHint=count?'此模块包含 '+count+' 条经历。删除模块会同时删除其中经历，可用撤销恢复。':'空模块可以直接删除。';
 openDialog('<h2>编辑模块</h2><form><div class="form-grid">'+field('模块名称','name',currentName,true)+'</div><p class="hint">'+moduleHint+'</p><div class="dialog-actions"><button type="button" class="danger module-delete" id="deleteModule">删除该模块</button><button type="button" data-close>取消</button><button class="primary">保存</button></div></form>',d=>change(()=>{const name=String(d.get('name')).trim();if(tab==='library')sec.name=bi(name||sec.name.zh,name||sec.name.en);else v().sectionNames[id]={...(v().sectionNames[id]||sec.name),[lang()]:name||currentName}}));
 $('#deleteModule').onclick=()=>{const warning='删除“'+currentName+'”模块'+(count?'及其中 '+count+' 条经历':'')+'？删除后可使用撤销恢复。';if(!confirm(warning))return;change(()=>{const entries=state.entries.filter(e=>e.section===id),ids=entries.map(e=>e.id),bulletIds=entries.flatMap(e=>e.bullets.map(b=>b.id));state.sections=state.sections.filter(s=>s.id!==id);state.entries=state.entries.filter(e=>e.section!==id);state.versions.forEach(w=>{w.order=w.order.filter(x=>!ids.includes(x));w.hidden=w.hidden.filter(x=>!ids.includes(x));w.hiddenBullets=w.hiddenBullets.filter(x=>!bulletIds.includes(x));ids.forEach(x=>delete w.overrides[x]);delete w.sectionNames[id];if(w.courses?.educationId===id)w.courses.educationId=''})});$('#editor').close();toast('模块已删除，可撤销')};
}
const v4Sidebar=renderSidebar;renderSidebar=function(){v4Sidebar();$('#library .notice')?.remove();versionRow.style.display=tab==='library'?'none':'flex';baseActions.style.display=tab==='current'&&!styleOpen?'flex':'none';$('#syncBase').disabled=!changedEntries().length;$('#restoreBase').disabled=!Object.keys(v().overrides).length;$$('[data-section-name]').forEach(b=>b.onclick=()=>editModule(b.dataset.sectionName));};
// The course panel is a grade-library editor. Course inclusion is intentionally not a UI choice;
// legacy versions keep their existing coursework list, while each course owns its score visibility.
function ensureCourseFlags(){state.courses.forEach(c=>{if(c.showScore===undefined)c.showScore=c.status==='graded'||c.status==='pass'})}
courseText=function(c,cfg){const name=text(c.name)||c.name.zh,parts=[];if(c.showScore!==false){if(c.status==='graded'&&String(c.score).trim())parts.push(String(c.score));else if(c.status==='pass')parts.push(lang()==='zh'?'通过':'Pass');else if(c.status==='pending')parts.push(lang()==='zh'?'待出分':'Pending')}return name+(parts.length?'（'+parts.join(' · ')+'）':'')};
showCourses=function(){ensureCourseFlags();openDialog(`<h2>成绩库</h2><p class="hint">维护课程名称、成绩及单门课程的成绩显示设置。</p><div class="row course-tools"><input id="courseSearch" placeholder="搜索课程"><button id="newCourse">＋ 课程</button></div><div class="course-scroll"><table class="course-table"><thead><tr><th>课程</th><th>成绩</th><th>显示成绩</th><th></th></tr></thead><tbody id="courseRows"></tbody></table></div><div class="dialog-actions"><span class="course-count" id="courseCount" style="margin-right:auto"></span><button data-close class="primary">完成</button></div>`);$('#editor').classList.add('simple-courses');$('#editor').addEventListener('close',()=>$('#editor').classList.remove('simple-courses'),{once:true});function rows(){const q=$('#courseSearch').value.toLowerCase();const list=state.courses.filter(c=>Object.values(c.name).some(n=>String(n||'').toLowerCase().includes(q)));$('#courseRows').innerHTML=list.map(c=>`<tr><td>${esc(text(c.name)||c.name.zh)}</td><td>${esc(c.status==='graded'?c.score:c.status==='pass'?'通过':'待出分')}</td><td><input type="checkbox" data-course-score="${esc(c.id)}" ${c.showScore!==false?'checked':''} aria-label="显示 ${esc(text(c.name))} 成绩"></td><td><button class="mini" data-edit-course="${esc(c.id)}">编辑</button></td></tr>`).join('');$('#courseCount').textContent='共 '+state.courses.length+' 门';$$('[data-course-score]').forEach(el=>el.onchange=()=>{const c=state.courses.find(c=>c.id===el.dataset.courseScore);if(!c)return;change(()=>c.showScore=el.checked);rows()});$$('[data-edit-course]').forEach(el=>el.onclick=()=>editCourse(el.dataset.editCourse))}$('#courseSearch').oninput=rows;$('#newCourse').onclick=()=>editCourse();rows()};
editCourse=function(id){const existing=state.courses.find(c=>c.id===id),c=clone(existing||{id:uid(),name:bi('',''),score:'',status:'pending',credits:0,term:''});$('#editor').close();openDialog(`<h2>${id?'编辑':'新增'}课程</h2><form><div class="form-grid">${field('课程名称','zh',c.name.zh,true)}${field('英文名称（选填）','en',c.name.en,true)}${field('成绩（选填，可填“通过”）','score',c.status==='pass'?'通过':c.score,true)}</div><div class="dialog-actions"><button type="button" data-close>取消</button><button class="primary">保存</button></div></form>`,d=>{if(!String(d.get('zh')).trim()&&!String(d.get('en')).trim())return toast('请输入课程名称');const score=String(d.get('score')).trim();change(()=>{c.name=bi(String(d.get('zh')).trim(),String(d.get('en')).trim());c.status=/^(P|Pass|通过)$/i.test(score)?'pass':score?'graded':'pending';c.score=c.status==='pass'?'P':score;if(existing)state.courses[state.courses.indexOf(existing)]=c;else state.courses.push(c)});setTimeout(showCourses,0)})};$('#courseBtn').onclick=()=>showCourses();
 renderStyles=function(){const s=v().style,c=pageConfig();$('#library').innerHTML=`<div class="settings"><h3>页面尺寸</h3><label class="field"><select id="pageKind">${['A4','A5','A3','long','custom'].map(k=>`<option value="${k}" ${c.kind===k?'selected':''}>${k==='long'?'长图':k==='custom'?'自定义':k}</option>`).join('')}</select></label>${['long','custom'].includes(c.kind)?`<div class="page-fields"><label class="field">宽度（mm）<input type="number" id="pageWidth" min="100" max="420" value="${c.width}"></label>${c.kind==='custom'?`<label class="field">高度（mm）<input type="number" id="pageHeight" min="100" max="600" value="${c.height}"></label>`:'<span class="hint">高度随内容延伸</span>'}</div>`:''}<h3>简历模板</h3><div class="template-grid">${THEMES.map(t=>`<button class="template-card ${t.id===s.template?'active':''}" data-theme-choice="${t.id}"><div class="template-preview preview-${t.id}" style="--swatch:${t.color}"><b></b><i></i><i></i><i></i><i></i></div>${t.name}</button>`).join('')}</div><h3>排版</h3><label class="field">字号<select id="fontSetting">${[8,9,9.5,10,10.5,11,11.5,12,14].map(n=>`<option ${n===s.font?'selected':''}>${n}</option>`).join('')}</select></label><label class="field">行距<input id="lineSetting" type="range" min="1.2" max="2" step=".05" value="${s.line}"></label><label class="field">左右边距（mm）<input id="marginSetting" type="number" min="8" max="35" value="${s.margin}"></label><label class="field">强调色<input id="colorSetting" type="color" value="${s.accent}"></label><button id="resetStyle">恢复默认排版</button></div>`;$('#pageKind').onchange=e=>change(()=>{s.page={kind:e.target.value,width:c.width,height:c.height||297};boundPhoto(s.photoLayout)});for(const [id,k,min,max]of[['pageWidth','width',100,420],['pageHeight','height',100,600]])if($('#'+id))$('#'+id).onchange=e=>change(()=>{s.page={...c,[k]:clamp(e.target.value,min,max)};boundPhoto(s.photoLayout)});$$('[data-theme-choice]').forEach(b=>b.onclick=()=>change(()=>{const t=THEMES.find(t=>t.id===b.dataset.themeChoice);s.template=t.id;s.accent=t.color}));for(const[id,key,min,max]of[['fontSetting','font',8,14],['lineSetting','line',1.2,2],['marginSetting','margin',8,35],['colorSetting','accent']])$('#'+id).onchange=e=>change(()=>{s[key]=key==='accent'?e.target.value:clamp(e.target.value,min,max);boundPhoto(s.photoLayout)});$('#resetStyle').onclick=()=>change(()=>{v().style={...s,font:12,line:1.55,margin:16,accent:(THEMES.find(t=>t.id===s.template)||THEMES[0]).color}})};
// One photo dialog owns display, upload, framing, crop and positioning.
editPhoto=function(){const source=profile().photo;let draft=clone(v().style.photoLayout),visible=v().style.photo;boundPhoto(draft);openDialog(`<h2>照片调整</h2><div class="photo-options"><label class="row"><input type="checkbox" id="photoVisible" ${visible?'checked':''}>显示照片</label><button id="replacePhoto">${source?'更换':'上传'}照片</button></div>${source?`<div class="crop-workspace"><div><div class="crop-preview" id="cropPreview"><img id="cropImage" src="${esc(source)}" alt="照片裁剪预览"></div><p class="hint" style="text-align:center">拖动画面调整取景</p></div><div class="crop-controls"><label class="field">画面缩放 <output id="cropValue"></output><input id="cropScale" type="range" min="1" max="5" step=".02" value="${draft.scale}"></label><label class="field">照片整体大小 <output id="sizeValue"></output><input id="photoSize" type="range" min="12" max="70" step=".5" value="${draft.width}"></label><div class="photo-position"><label class="field">宽（mm）<input id="photoWidth" type="number" min="12" max="70" value="${draft.width}"></label><label class="field">高（mm）<input id="photoHeight" type="number" min="16" max="90" value="${draft.height}"></label></div><label class="field">圆角<input id="photoRadius" type="range" min="0" max="50" value="${draft.radius}"></label><div class="row"><button id="photoLeft">靠左</button><button id="photoRight">靠右</button><button id="cropReset">重置</button></div></div></div>`:'<div class="photo-empty">选择 JPG 或 PNG 照片</div>'}<div class="dialog-actions"><button data-close>取消</button><button id="applyPhoto" class="primary">应用</button></div>`);$('#editor').classList.add('photo-dialog');$('#editor').addEventListener('close',()=>$('#editor').classList.remove('photo-dialog'),{once:true});$('#photoVisible').onchange=e=>visible=e.target.checked;$('#replacePhoto').onclick=()=>$('#photoInput').click();$('#applyPhoto').onclick=()=>{change(()=>{v().style.photoLayout=boundPhoto(draft);v().style.photo=visible});$('#editor').close()};if(!source)return;
 function update(){boundPhoto(draft);$('#cropPreview').style.aspectRatio=draft.width+'/'+draft.height;$('#cropPreview').style.borderRadius=draft.radius+'px';$('#cropImage').style.cssText=cropImageStyle(draft);$('#cropValue').textContent=Math.round(draft.scale*100)+'%';$('#sizeValue').textContent=Math.round(draft.width)+' × '+Math.round(draft.height)+' mm';for(const[id,key]of[['photoWidth','width'],['photoHeight','height'],['cropScale','scale'],['photoSize','width'],['photoRadius','radius']])$('#'+id).value=draft[key]}
 for(const[id,key,min,max]of[['cropScale','scale',1,5],['photoWidth','width',12,70],['photoHeight','height',16,90],['photoRadius','radius',0,50]])$('#'+id).oninput=e=>{draft[key]=clamp(e.target.value,min,max);update()};$('#photoSize').oninput=e=>{const ratio=draft.height/draft.width;draft.width=Number(e.target.value);draft.height=draft.width*ratio;update()};$('#photoLeft').onclick=()=>{draft.x=0;draft.y=0;update()};$('#photoRight').onclick=()=>{draft.x=bodyWidth()-draft.width;draft.y=0;update()};$('#cropReset').onclick=()=>{draft={...clone(photoDefaults),ratio:draft.ratio,x:bodyWidth()-25};update()};const box=$('#cropPreview');box.onpointerdown=e=>{e.preventDefault();box.setPointerCapture(e.pointerId);const start={x:e.clientX,y:e.clientY,fx:draft.focusX,fy:draft.focusY},img=$('#cropImage').getBoundingClientRect(),frame=box.getBoundingClientRect();box.onpointermove=ev=>{if(img.width>frame.width)draft.focusX=clamp(start.fx-(ev.clientX-start.x)/(img.width-frame.width),0,1);if(img.height>frame.height)draft.focusY=clamp(start.fy-(ev.clientY-start.y)/(img.height-frame.height),0,1);update()};box.onpointerup=box.onpointercancel=()=>box.onpointermove=null};update();};$('#quickPhotoBtn').onclick=()=>editPhoto();
bindPhotoDrag=function(){const box=$('.photo-box');if(!box)return;box.ondblclick=()=>editPhoto();const handle=document.createElement('span');handle.className='photo-resize';handle.title='拖动缩放照片';handle.dataset.html2canvasIgnore='true';box.append(handle);box.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();const resize=e.target===handle,f=v().style.photoLayout,start=clone(f),px=e.clientX,py=e.clientY,unit=96/25.4*Number($('#zoom').value);let moved=false;box.setPointerCapture(e.pointerId);box.onpointermove=ev=>{const dx=(ev.clientX-px)/unit,dy=(ev.clientY-py)/unit;if(!moved&&Math.abs(dx)+Math.abs(dy)>.3){checkpoint();moved=true}if(!moved)return;if(resize){f.width=clamp(start.width+dx,12,Math.min(70,bodyWidth()));f.height=f.width*start.height/start.width}else{f.x=start.x+dx;f.y=start.y+dy}boundPhoto(f);box.style.left=f.x+'mm';box.style.top=f.y+'mm';box.style.width=f.width+'mm';box.style.height=f.height+'mm';box.querySelector('img').style.cssText=cropImageStyle(f)};box.onpointerup=box.onpointercancel=()=>{box.onpointermove=null;if(moved){save();renderPaper()}}};};
const v4Paper=renderPaper;renderPaper=function(){boundPhoto(v().style.photoLayout);v4Paper();const c=pageConfig(),p=$('#paper'),f=v().style.photoLayout,head=p.querySelector('.cv-header');p.style.width=c.width+'mm';p.style.minHeight=(c.height||0)+'mm';p.style.setProperty('--page-width',c.width+'mm');p.style.setProperty('--page-height',(c.height||0)+'mm');if(head.classList.contains('has-photo')){head.style.paddingLeft='';head.style.setProperty('--photo-reserve','0mm');if(f.x+f.width/2>bodyWidth()/2)head.style.setProperty('--photo-reserve',Math.max(0,bodyWidth()-f.x+3)+'mm');else head.style.paddingLeft=(f.x+f.width+4)+'mm'}requestAnimationFrame(measure)};
const pagePrint=document.createElement('style');pagePrint.id='pagePrint';document.head.append(pagePrint);
measure=function(){const p=$('#paper');if(!p||!v())return;const c=pageConfig(),z=Number($('#zoom').value),mm=25.4/96,height=p.offsetHeight*mm,over=c.height>0&&height>c.height+1;$('.paper-wrap').style.width=p.offsetWidth*z+'px';$('.paper-wrap').style.height=p.offsetHeight*z+'px';$('#pageStatus').textContent=(c.kind==='long'?'长图':c.kind==='custom'?'自定义':c.kind)+' · '+c.width+' × '+Math.round(c.height||height)+' mm';$('#overflowStatus').className=over?'warn':'ok';$('#overflowStatus').textContent=c.kind==='long'?'● 高度随内容延伸':over?'● 内容超出单页 '+Math.ceil(height-c.height)+' mm':'● 内容未超页';pagePrint.textContent=`@page{size:${c.width}mm ${Math.ceil(c.height||height)}mm;margin:0}`;};
const pageQuickBar=$('.status');
if(pageQuickBar&&!$('#pageQuickKind')){
  pageQuickBar.insertAdjacentHTML('afterbegin','<label class="page-quick"><span>页面</span><select id="pageQuickKind" aria-label="页面尺寸"><option value="A4">A4</option><option value="A5">A5</option><option value="A3">A3</option><option value="long">长图</option></select></label>');
  const pageText=pageQuickBar.querySelector('#pageStatus');
  if(pageText)pageQuickBar.querySelector('.page-quick').append(pageText);
  $('#pageQuickKind').onchange=e=>{const kind=e.target.value,c=pageConfig();change(()=>{v().style.page={kind,width:pagePresets[kind]?.[0]??c.width,height:pagePresets[kind]?.[1]??c.height}})};
}
const v6MeasureBase=measure;
measure=function(){v6MeasureBase();const c=pageConfig();if($('#pageQuickKind'))$('#pageQuickKind').value=c.kind};
$('#zoom').onchange=()=>renderPaper();
$('#styleBtn').textContent='排版';$('#backToProjects').textContent='← 首页';$('#restoreBtn').hidden=true;
// Unified export menu. HTML remains self-contained; PNG is rendered locally.
$('#htmlBtn').hidden=true;$('#pdfBtn').textContent='导出';$('#pdfBtn').onclick=()=>{document.activeElement?.blur();openDialog('<h2>导出简历</h2><div class="export-options"><button id="exportPdf">PDF<small>使用浏览器打印，选择“存储为 PDF”</small></button><button id="exportHtml">静态 HTML</button><button id="exportPng">PNG 长图</button></div><div class="dialog-actions"><button data-close>取消</button></div>');$('#exportPdf').onclick=()=>{$('#editor').close();measure();if(pageConfig().kind!=='long'&&$('#overflowStatus').classList.contains('warn')&&!confirm('内容超出当前纸张，将分成多页。继续？'))return;window.print()};$('#exportHtml').onclick=()=>{$('#editor').close();exportHTML()};$('#exportPng').onclick=()=>{$('#editor').close();exportPNG()}};
function cleanPaper(){const p=$('#paper').cloneNode(true);p.style.transform='none';p.style.zoom='1';p.style.boxShadow='none';p.querySelectorAll('.photo-tip,.photo-resize').forEach(e=>e.remove());p.querySelectorAll('[contenteditable]').forEach(e=>{e.removeAttribute('contenteditable');e.classList.remove('editable')});return p;}
exportHTML=function(){measure();const p=cleanPaper();const css=$$('style').map(s=>s.textContent).join('\n')+'\n'+window.v4ExportCSS;download(filename('html'),'<!doctype html><html lang="'+(lang()==='en'?'en':'zh-CN')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(text(profile().name))+'</title><style>'+css+'body{background:#eee;padding:24px}.paper{margin:auto}@media print{body{padding:0;background:white}}</style></head><body>'+p.outerHTML+'</body></html>','text/html')};
async function exportPNG(){if(typeof html2canvas!=='function')return toast('图片组件未加载，请确认 assets 文件夹与网页放在一起');document.activeElement?.blur();await document.fonts.ready;const paper=cleanPaper();paper.removeAttribute('id');paper.style.margin='0';paper.style.minHeight='0';const host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;';host.append(paper);document.body.append(host);try{await Promise.all([...paper.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})));const scale=Math.min(2,15000/Math.max(paper.offsetWidth,paper.offsetHeight));if(scale<.5)throw Error('内容过长，请分为多个版本导出');const canvas=await html2canvas(paper,{scale,backgroundColor:'#ffffff',logging:false,windowWidth:1600,windowHeight:Math.max(1000,paper.offsetHeight)});const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(!blob)throw Error('图片生成失败');download(filename('png'),blob,'image/png');toast('长图已导出')}catch(e){toast('无法导出：'+e.message)}finally{host.remove()}}
// Style text is supplied locally by the build to keep exported HTML independent.
window.v4ExportCSS=window.v4ExportCSS||'';
if(projectDB)renderHome();
/* v6 final home selection: keep the v4 two-card start screen. */
renderHome=v6SimpleHome;
if(projectDB)renderHome();

/* Every modal gets a consistent close button, including the template picker,
   course library and AI prompt.  The button is intentionally added after the
   existing dialog wiring so legacy data-entry forms keep their behavior. */
const v8OpenDialogBase=openDialog;
openDialog=function(html,submit){
  v8OpenDialogBase(html,submit);
  const dialog=$('#editor');
  if(dialog&&!dialog.querySelector('.modal-close')){
    const close=document.createElement('button');
    close.type='button';close.className='modal-close';close.setAttribute('aria-label','关闭');close.title='关闭';close.textContent='×';
    close.onclick=()=>dialog.close();
    dialog.prepend(close);
  }
};

/* Keep the profile controls compact and remove the old explanatory sentence
   every time the editor rerenders. */
const v8RenderBase=render;
render=function(...args){
  const result=v8RenderBase(...args);
  const profileButton=$('#profileBtn');
  profileButton?.querySelector('.hint')?.remove();
  return result;
};

/* Grade library: courses and score visibility are independently selectable.
   This keeps the library useful for both a short and a detailed resume. */
function v8ShowCourses(){
  ensureCourseFlags();
  const cfg=v().courses||(v().courses={...clone(courseDefaults),enabled:true,autoLink:true,selected:[]});
  cfg.selected=Array.isArray(cfg.selected)?cfg.selected:[];
  openDialog(`<h2>成绩库</h2><p class="hint">维护课程名称、成绩，并选择当前版本使用的课程。</p><div class="row course-tools"><input id="courseSearch" placeholder="搜索课程" aria-label="搜索课程"><button id="newCourse">＋ 课程</button></div><div class="course-scroll"><table class="course-table"><thead><tr><th>选择课程</th><th>课程</th><th>成绩</th><th>显示成绩</th><th></th></tr></thead><tbody id="courseRows"></tbody></table></div><div class="row course-tools"><span class="course-count" id="courseCount"></span><button type="button" id="selectAllCourses">全选课程</button><button type="button" id="clearCourses">取消全选课程</button><button type="button" id="clearScoreDisplay">取消所有成绩显示</button></div><div class="dialog-actions"><button class="primary" data-close>完成</button></div>`);
  $('#editor').classList.add('simple-courses');
  $('#editor').addEventListener('close',()=>$('#editor').classList.remove('simple-courses'),{once:true});
  function rows(){
    const query=String($('#courseSearch')?.value||'').trim().toLowerCase();
    const list=state.courses.filter(c=>!query||JSON.stringify(c.name||{}).toLowerCase().includes(query));
    $('#courseRows').innerHTML=list.map(c=>{
      const label=text(c.name)||c.name?.zh||'';
      const score=c.status==='graded'?c.score:c.status==='pass'?'通过':'待出分';
      return `<tr><td><input type="checkbox" data-course-select="${esc(c.id)}" ${cfg.selected.includes(c.id)?'checked':''} aria-label="选择 ${esc(label)}"></td><td>${esc(label)}</td><td>${esc(score)}</td><td><input type="checkbox" data-course-score="${esc(c.id)}" ${c.showScore!==false?'checked':''} aria-label="显示 ${esc(label)} 成绩"></td><td><button class="mini" data-edit-course="${esc(c.id)}">编辑</button></td></tr>`;
    }).join('');
    $('#courseCount').textContent=`已选择 ${cfg.selected.length} / ${state.courses.length} 门`;
    $$('[data-course-select]').forEach(input=>input.onchange=()=>{
      change(()=>{const id=input.dataset.courseSelect,index=cfg.selected.indexOf(id);if(input.checked&&index<0)cfg.selected.push(id);if(!input.checked&&index>=0)cfg.selected.splice(index,1);cfg.enabled=true});rows();
    });
    $$('[data-course-score]').forEach(input=>input.onchange=()=>{
      const course=state.courses.find(c=>c.id===input.dataset.courseScore);if(!course)return;
      change(()=>course.showScore=input.checked);rows();
    });
    $$('[data-edit-course]').forEach(button=>button.onclick=()=>editCourse(button.dataset.editCourse));
  }
  $('#courseSearch').oninput=rows;
  $('#newCourse').onclick=()=>editCourse();
  $('#selectAllCourses').onclick=()=>{change(()=>{cfg.selected=state.courses.map(c=>c.id);cfg.enabled=true});rows()};
  $('#clearCourses').onclick=()=>{change(()=>cfg.selected=[]);rows()};
  $('#clearScoreDisplay').onclick=()=>{change(()=>state.courses.forEach(c=>c.showScore=false));rows()};
  rows();
}
showCourses=v8ShowCourses;
$('#courseBtn').onclick=()=>showCourses();

/* The public start screen intentionally stays minimal: exactly two entry points. */
function v6SimpleHome(){
 document.body.dataset.mode='home';document.title='ResuWeave';
 $('#projectHome').innerHTML=`<div class="start-grid"><section class="start-card"><h1>打开已有文件</h1><div class="drop-target" id="openResume" role="button" tabindex="0" aria-label="打开简历项目文件"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 15V9h13l5 6h16v25H7z"/><path d="M7 20h34"/></svg><span>选择项目文件，或拖到这里</span><small>.resume.json · 仅支持可继续编辑的项目文件</small></div></section><section class="start-card"><h1>创建新文件</h1><div class="start-previews">${['blue','classic','sidebar'].map((id,i)=>{const t=THEMES.find(t=>t.id===id),s=v6SampleForTheme(i);return`<div class="start-sample-preview"><div class="sample-thumb">${v6SamplePreview(t,s)}</div></div>`}).join('')}</div><button class="primary" id="chooseTemplate">从模板开始创建 →</button></section></div>`;
 const drop=$('#openResume');drop.onclick=()=>openExisting();drop.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();openExisting()}};drop.ondragover=e=>{e.preventDefault();drop.classList.add('drag-over')};drop.ondragleave=()=>drop.classList.remove('drag-over');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('drag-over');if(e.dataTransfer.files[0])importResume(e.dataTransfer.files[0])};$('#chooseTemplate').onclick=()=>v6ShowTemplatePicker();
}
renderHome=v6SimpleHome;
if(projectDB)renderHome();

/* v6: stable project dashboard, sample workspaces, version isolation, and cleanup. */
const V6_SAMPLES=[
 {id:'spongebob',avatar:'SB',name:bi('海绵宝宝','SpongeBob SquarePants'),headline:bi('餐饮运营 · 客户体验 · 门店增长','Restaurant Operations · Customer Experience · Store Growth'),email:'sponge.bob@bikinibottom.com',location:bi('比奇堡','Bikini Bottom'),entries:[
  {id:'sponge-edu',section:'education',title:bi('比奇堡职业学院','Bikini Bottom Vocational College'),role:bi('餐饮运营与服务管理 · 文凭','Restaurant Operations & Service Management · Diploma'),date:'持续进修',bullets:[['主修课程：服务运营、食品标准化、消费者行为、门店经营分析、供应链基础。','Coursework: service operations, food standardization, consumer behavior, store analytics, and supply chain basics.'],['持续参与驾驶与安全训练，形成高频训练和标准执行习惯。','Pursued recurring driving and safety training; built strong habits around repetition and standard execution.']]},
  {id:'sponge-work',section:'work',title:bi('蟹堡王','Krusty Krab'),role:bi('核心煎炸厨师','Fry Cook'),date:'长期任职',bullets:[['负责核心产品标准化制作与高峰期订单交付，长期保持稳定产品质量与出餐效率。','Delivered standardized core products and peak-period orders with consistent quality and speed.'],['支持卫生维护、开闭店准备、前厅协同及特殊订单，覆盖生产—服务—交付全流程。','Supported sanitation, opening/closing, front-of-house coordination, and special orders across the full service flow.'],['多次获得月度最佳员工认可，并参与首次披萨配送项目的端到端履约。','Recognized repeatedly as Employee of the Month and helped execute the first end-to-end pizza delivery pilot.']]},
  {id:'sponge-project-1',section:'projects',title:bi('蟹堡王高峰期生产与客户履约体系','Krusty Krab Peak-Period Fulfillment System'),role:bi('核心执行成员','Core Operator'),date:'长期项目',bullets:[['串联订单接收、后厨制作、质量检查与前厅交付，支持高密度即时订单场景。','Connected order intake, kitchen production, quality checks, and front-of-house delivery for high-density orders.'],['将非常规需求转化为可执行生产任务，持续强化产品一致性与客户体验。','Converted non-standard requests into executable tasks while protecting product consistency and customer experience.']]},
  {id:'sponge-project-2',section:'projects',title:bi('巧克力上门销售商业化项目','Traveling Chocolate Commercial Experiment'),role:bi('联合发起人 · 销售与客户开发','Co-founder · Sales & Customer Development'),date:'项目制',bullets:[['与派大星联合完成产品选择、采购、上门拜访及销售话术迭代。','Co-developed product selection, sourcing, door-to-door outreach, and sales messaging with Patrick Star.'],['在早期转化有限时调整沟通方式，完成从产品导向到需求导向的销售验证。','Shifted from product-led to needs-led selling after iterating through early conversion challenges.']]},
  {id:'sponge-skills',section:'skills',title:bi('运营与客户体验','Operations & Customer Experience'),role:bi('门店运营 · 客户服务 · 基础销售','Store Operations · Customer Service · Sales'),date:'',bullets:[['门店运营、订单履约、SOP 执行、异常处理、客户沟通、陌生客户开发。','Store operations, order fulfillment, SOP execution, exception handling, customer communication, and outreach.']]}
 ]},
 {id:'squidward',avatar:'SQ',name:bi('章鱼哥','Squidward J. Q. Tentacles'),headline:bi('品牌与艺术管理 · 活动策划 · 前台运营','Brand & Arts Management · Events · Front-of-House Operations'),email:'squidward@tentacles.art',location:bi('比奇堡','Bikini Bottom'),entries:[
  {id:'squid-edu',section:'education',title:bi('比奇堡艺术学院','Bikini Bottom School of Arts'),role:bi('艺术管理与音乐表演 · 艺术学学士','Arts Management & Music Performance · BFA'),date:'长期艺术实践',bullets:[['主修艺术史、音乐表演、品牌美学、文化项目管理与艺术市场营销。','Coursework: art history, music performance, brand aesthetics, cultural project management, and arts marketing.'],['长期进行单簧管、绘画与雕塑创作，形成统一的个人艺术表达。','Maintained long-term clarinet, painting, and sculpture practice with a coherent artistic voice.']]},
  {id:'squid-work',section:'work',title:bi('蟹堡王','Krusty Krab'),role:bi('前台收银员','Cashier'),date:'长期任职',bullets:[['负责点单、订单录入、收银及前后厨信息传递，承担核心面向客户职能。','Handled ordering, transaction entry, payment, and front-to-back information flow in a customer-facing role.'],['与后厨和经营者长期协同，在风格差异明显的团队中保持业务连续性。','Maintained operating continuity while collaborating with the kitchen and owner in a high-friction team.'],['获得比奇堡“最郁闷收银员”称号，形成鲜明的一线服务个人品牌。','Built a distinctive service persona recognized locally as Bikini Bottom’s “Most Miserable Cashier.”']]},
  {id:'squid-project-1',section:'projects',title:bi('泡泡碗大型音乐演出项目','Bubble Bowl Concert Project'),role:bi('乐队发起人 · 指挥 · 项目负责人','Founder · Conductor · Project Lead'),date:'一周内完成筹备',bullets:[['从 0 招募社区成员，负责训练计划、场地器材、排练和现场指挥。','Recruited a community band from scratch and led training, logistics, rehearsals, and the live performance.'],['在成员基础差异大、纪律薄弱和内部冲突下推进项目，最终完成大型演出交付。','Delivered a major concert despite mixed skill levels, weak discipline, and internal conflict.']]},
  {id:'squid-project-2',section:'projects',title:bi('独立艺术家个人品牌项目','Independent Artist Brand'),role:bi('艺术创作者','Artist'),date:'长期项目',bullets:[['围绕绘画、雕塑和单簧管表演持续创作，建立统一的个人审美与表达体系。','Built a consistent personal aesthetic through painting, sculpture, and clarinet performance.'],['负责作品创作、审美把控和个人展示，保持内容调性与创作节奏。','Owned creation, quality control, and presentation while maintaining a clear creative cadence.']]},
  {id:'squid-skills',section:'skills',title:bi('艺术与活动管理','Arts & Event Management'),role:bi('艺术策展 · 活动统筹 · 前台运营','Curation · Event Production · Front-of-House Operations'),date:'',bullets:[['单簧管、绘画、雕塑、艺术策展、成员招募、排练管理、现场统筹。','Clarinet, painting, sculpture, curation, member recruitment, rehearsal management, and event production.']]}
 ]},
 {id:'patrick',avatar:'PS',name:bi('派大星','Patrick Star'),headline:bi('创意营销 · 消费者洞察 · 战略休闲管理','Creative Marketing · Consumer Insight · Strategic Leisure'),email:'patrick@underarock.com',location:bi('比奇堡','Bikini Bottom'),entries:[
  {id:'patrick-edu',section:'education',title:bi('比奇堡开放大学','Bikini Bottom Open University'),role:bi('通识研究与休闲管理','General Studies & Leisure Management'),date:'弹性学制',bullets:[['主修消费者心理学、创意思维、基础市场营销、休闲经济学与行为决策。','Coursework: consumer psychology, creative thinking, marketing fundamentals, leisure economics, and behavioral decision-making.'],['擅长把复杂问题重新定义为更容易理解的基本命题。','Known for simplifying complex questions into intuitive, easy-to-communicate propositions.']]},
  {id:'patrick-work',section:'work',title:bi('海之霸','Chum Bucket'),role:bi('广告总监','Advertising Director'),date:'项目制',bullets:[['参与门店户外广告优化，提出极简传播口号“杂烩很棒”，推动门店从零客流形成排队。','Created the “Chum is Fum” message, helping a zero-traffic store generate queues through simple outdoor advertising.'],['将核心口号延展至招牌、门店物料和口碑传播，完成从创意到获客的闭环。','Extended the slogan across signage, in-store materials, and word of mouth to connect creativity with acquisition.']]},
  {id:'patrick-project-1',section:'projects',title:bi('“杂烩很棒”品牌焕新活动','Chum is Fum Brand Refresh Campaign'),role:bi('核心创意','Creative Lead'),date:'短周期增长实验',bullets:[['把复杂产品传播压缩为低理解成本的核心品牌资产，快速建立消费者记忆点。','Compressed complex product messaging into a low-friction brand asset that built rapid recall.'],['通过传播策略带动门店排队和媒体曝光，验证品牌传播对短周期获客的影响。','Drove queues and media attention, validating the impact of brand messaging on short-cycle acquisition.']]},
  {id:'patrick-project-2',section:'projects',title:bi('巧克力上门销售创业项目','Traveling Chocolate Venture'),role:bi('联合创始人 · 产品创意','Co-founder · Product Concept'),date:'最小可行产品验证',bullets:[['与海绵宝宝选择巧克力作为最小可行产品，通过上门拜访完成冷启动获客。','Selected chocolate as an MVP with SpongeBob and tested cold-start customer acquisition door to door.'],['持续参与客户开发与销售策略调整，验证个人消费者市场销售模式。','Iterated customer development and sales tactics to validate a direct-to-consumer model.']]},
  {id:'patrick-skills',section:'skills',title:bi('品牌营销与创意策略','Brand Marketing & Creative Strategy'),role:bi('口号创意 · 消费者洞察 · 非传统问题解决','Slogan Design · Consumer Insight · Unconventional Problem Solving'),date:'',bullets:[['品牌记忆点设计、产品演示、陌生客户开发、发散思维与低约束创意输出。','Brand recall, product demos, outreach, divergent thinking, and unconstrained creative output.']]}
 ]},
 {id:'krabs',avatar:'EK',name:bi('蟹老板','Eugene H. Krabs'),headline:bi('餐饮连锁经营 · 成本管理 · 资本运作','Restaurant Operations · Cost Management · Capital Strategy'),email:'eugene@krustykrab.com',location:bi('比奇堡','Bikini Bottom'),entries:[
  {id:'krabs-edu',section:'education',title:bi('比奇堡商学院','Bikini Bottom Business School'),role:bi('企业经营与财务管理','Business Administration · Executive Education'),date:'高管进修',bullets:[['主修公司金融、管理会计、成本控制、餐饮运营、消费者定价和企业战略。','Coursework: corporate finance, management accounting, cost control, restaurant operations, pricing, and strategy.'],['长期关注单位经济模型、现金流和资本回报率，具备极强成本敏感度。','Focused on unit economics, cash flow, and return on capital with an unusually sharp cost lens.']]},
  {id:'krabs-work',section:'work',title:bi('蟹堡王','Krusty Krab'),role:bi('创始人兼所有者','Founder & Owner'),date:'长期经营',bullets:[['创立并经营区域头部快餐品牌，围绕核心产品建立稳定门店业务和品牌资产。','Founded and operated a leading local quick-service brand around a flagship SKU and durable brand equity.'],['管理后厨与前台团队，覆盖生产、收银、采购和日常门店运营。','Managed kitchen and front-of-house teams across production, cashiering, procurement, and daily operations.'],['围绕配方、商标、设备和现金资产建立强资产意识，并持续应对竞品竞争。','Protected recipes, trademarks, equipment, and cash while maintaining a clear competitive edge.']]},
  {id:'krabs-project-1',section:'projects',title:bi('蟹堡塔酒店业务孵化','Krusty Towers Hospitality Venture'),role:bi('创始人 · 新业务负责人','Founder · New Business Lead'),date:'邻近业务扩张',bullets:[['从高溢价住宿体验识别服务业机会，将既有餐饮资产快速改造为酒店业务。','Identified a high-priced hospitality opportunity and repurposed existing restaurant assets into a hotel.'],['设计高端服务模式，完成从市场观察、产品定义到实际营业的最小可行产品验证。','Designed a premium service model and validated the opportunity from observation through launch.']]},
  {id:'krabs-project-2',section:'projects',title:bi('蟹堡王股权出售与回购项目','Krusty Krab Sale & Re-acquisition'),role:bi('交易负责人','Transaction Lead'),date:'创始 — 出售 — 回购',bullets:[['完成企业所有权、员工、标识与经营资产的整体出售谈判。','Negotiated a full-company sale covering ownership, employees, logo, and operating assets.'],['在品牌和产品质量偏离后重新介入，最终完成资产回购并恢复原有品牌体系。','Re-entered after brand dilution and completed the re-acquisition to restore the operating system.']]},
  {id:'krabs-project-3',section:'projects',title:bi('蟹堡纪事自有媒体增长项目','Krabby Kronicle Owned-Media Growth'),role:bi('出版人 · 增长负责人','Publisher · Growth Lead'),date:'低成本增长实验',bullets:[['从付费广告转向自有媒体，启动自有报纸并探索内容到门店获客的路径。','Shifted from paid advertising to owned media and connected content distribution with store acquisition.'],['以低成本内容实验验证新的获客渠道和品牌延展空间。','Used low-cost content experiments to test a new acquisition channel and brand extension.']]},
  {id:'krabs-skills',section:'skills',title:bi('经营管理与资本运作','Operations & Capital Strategy'),role:bi('P&L · 门店管理 · 定价 · 交易谈判','P&L · Store Management · Pricing · Deal Negotiation'),date:'',bullets:[['成本控制、现金流管理、业务孵化、竞争战略、企业出售与资产回购。','Cost control, cash management, venture incubation, competitive strategy, exits, and re-acquisitions.']]}
 ]},
 {id:'plankton',avatar:'SP',name:bi('痞老板','Sheldon J. Plankton'),headline:bi('研发战略 · 竞争情报 · 增长实验','R&D Strategy · Competitive Intelligence · Growth Experiments'),email:'plankton@chumbucket.ai',location:bi('比奇堡','Bikini Bottom'),entries:[
  {id:'plankton-edu',section:'education',title:bi('比奇堡科技大学','Bikini Bottom Institute of Technology'),role:bi('生物工程与智能系统 · B.S.','Bioengineering & Intelligent Systems · B.S.'),date:'College Graduate',bullets:[['主修生物工程、机器人系统、自动化控制、产品研发、竞争战略与实验设计。','Coursework: bioengineering, robotics, automation, product R&D, competitive strategy, and experimental design.'],['长期开展跨学科产品研发，将机械、自动化与餐饮业务结合。','Applied interdisciplinary R&D across mechanics, automation, and food-service operations.']]},
  {id:'plankton-work',section:'work',title:bi('海之霸','Chum Bucket'),role:bi('创始人兼所有者','Founder & Owner'),date:'长期经营',bullets:[['独立创立并经营餐饮品牌，负责战略、产品研发、营销、运营和竞争研究。','Founded and operated a restaurant brand across strategy, product R&D, marketing, operations, and competitive research.'],['建立内部实验室与技术研发基础设施，与凯伦共同推进数据处理、设施控制和经营决策。','Built an internal lab and worked with Karen on data processing, facility control, and operating decisions.'],['持续跟踪蟹堡王，围绕核心产品和经营模式开展竞争情报研究。','Maintained long-term competitive intelligence on Krusty Krab’s product and operating model.']]},
  {id:'plankton-project-1',section:'projects',title:bi('“杂烩很棒”增长活动','Chum is Fum Growth Campaign'),role:bi('创始人支持人 · 增长策略','Founder Sponsor · Growth Strategy'),date:'短周期增长实验',bullets:[['在零客流瓶颈下优化户外广告，以极简口号迅速建立品牌记忆点。','Addressed a zero-traffic bottleneck with outdoor advertising and a memorable minimal slogan.'],['推动门店排队、媒体曝光和竞争分流，验证传播对短周期获客的影响。','Generated queues, media attention, and competitive switching to validate short-cycle acquisition effects.']]},
  {id:'plankton-project-2',section:'projects',title:bi('蟹堡反向工程研究','Krabby Patty Competitive Reverse Engineering'),role:bi('项目负责人 · 研发与竞争情报','Project Lead · R&D / Competitive Intelligence'),date:'长期实验项目',bullets:[['围绕头部产品建立长期竞争基准研究项目，持续拆解产品与流程壁垒。','Built a long-term benchmarking program to analyze product and process moats.'],['覆盖原型设备、自动化系统和身份模拟等路线，每次失败后进行根因分析。','Tested prototypes, automation, and identity-based approaches with rapid root-cause analysis after each failure.']]},
  {id:'plankton-project-3',section:'projects',title:bi('创始人跟随式管理实验','Founder Shadowing Management Experiment'),role:bi('战略研究项目','Strategic Research Project'),date:'沉浸式研究',bullets:[['通过沉浸式体验竞争对手管理者角色，研究员工、顾客、产品和家庭利益相关方。','Studied employees, customers, products, and family stakeholders through an immersive competitor-management experiment.'],['重新评估成功管理模式与自身战略目标之间的差异，形成更完整的经营认知。','Reassessed the gap between a successful operating model and personal strategic goals.']]},
  {id:'plankton-skills',section:'skills',title:bi('技术研发与竞争战略','R&D & Competitive Strategy'),role:bi('原型设计 · 自动化 · 竞争研究 · 增长实验','Prototyping · Automation · Competitive Intelligence · Growth Experiments'),date:'',bullets:[['机器人、自动化、实验设计、基准研究、失败分析、商业模式分析。','Robotics, automation, experimentation, benchmarking, failure analysis, and business-model analysis.']]}
 ]}
];
/* Keep the built-in samples language-clean in both modes.  Dates are neutral
   numeric ranges so English mode never inherits Chinese labels; the renderer
   translates 至今 to Present for the English version. */
const V6_SAMPLE_DATES={
 'sponge-edu':'2020 — 至今','sponge-work':'2021 — 至今','sponge-project-1':'2024 — 至今','sponge-project-2':'2023',
 'squid-edu':'2018 — 至今','squid-work':'2020 — 至今','squid-project-1':'2024','squid-project-2':'2019 — 至今',
 'patrick-edu':'2020 — 至今','patrick-work':'2024','patrick-project-1':'2024','patrick-project-2':'2024',
 'krabs-edu':'2010 — 至今','krabs-work':'1999 — 至今','krabs-project-1':'2022','krabs-project-2':'2023','krabs-project-3':'2024',
 'plankton-edu':'2010 — 至今','plankton-work':'2005 — 至今','plankton-project-1':'2024','plankton-project-2':'2021 — 至今','plankton-project-3':'2023'
};
V6_SAMPLES.forEach(s=>s.entries.forEach(e=>{if(V6_SAMPLE_DATES[e.id])e.date=V6_SAMPLE_DATES[e.id]}));
const v6SpongeSkills=V6_SAMPLES.find(s=>s.id==='spongebob')?.entries.find(e=>e.id==='sponge-skills');
if(v6SpongeSkills)v6SpongeSkills.bullets[0][0]='门店运营、订单履约、标准流程执行、异常处理、客户沟通、陌生客户开发。';
const v6KrabsSkills=V6_SAMPLES.find(s=>s.id==='krabs')?.entries.find(e=>e.id==='krabs-skills');
if(v6KrabsSkills)v6KrabsSkills.role.zh='损益管理 · 门店管理 · 定价 · 交易谈判';
const V6_SAMPLE_MAP=Object.fromEntries(V6_SAMPLES.map(s=>[s.id,s]));
const V6_SAMPLE_PHOTOS={spongebob:'assets/samples/spongebob.png',squidward:'assets/samples/squidward.png',patrick:'assets/samples/patrick.png',krabs:'assets/samples/krabs.png',plankton:'assets/samples/plankton.png'};
V6_SAMPLES.forEach(s=>{s.photo=V6_SAMPLE_PHOTOS[s.id]||''});
const v6SampleText=x=>typeof x==='object'?(x?.zh||x?.en||''):String(x??'');
const v6SampleEntry=d=>entry(d.id,d.section,d.title,d.role,d.date,d.bullets.map((b)=>bi(b[0],b[1])));
function v6SampleWorkspace(sample,theme){
 const entries=sample.entries.map(v6SampleEntry),education=entries.find(e=>e.section==='education');
 const version=makeVersion(sample.name.zh+'版');version.order=entries.map(e=>e.id);version.hidden=[];version.hiddenBullets=[];version.overrides={};version.sectionNames={};version.profile={};version.style.template=theme.id;version.style.accent=theme.color;version.style.photo=Boolean(sample.photo);version.style.page={kind:'A4',width:210,height:297};version.style.photoLayout=clone(photoDefaults);version.style.photoLayout.x=149;version.courses={...clone(courseDefaults),enabled:false,autoLink:true,selected:[],educationId:education?.id||''};
 return{schema:1,workspaceKind:'sample',sampleId:sample.id,entries,sections:clone(defaultState.sections),profile:{name:sample.name,headline:sample.headline,phone:'',email:sample.email,location:sample.location,photo:sample.photo||''},versions:[version],active:version.id,courses:[],upgrades:{sampleBikiniBottom:true,contentOptimized:true}};
}
function v6PreviewEntries(sample){return sample.entries.filter(e=>e.section!=='skills').slice(0,3)}
function v6SamplePreview(theme,sample){
 const initials=sample.avatar,entries=v6PreviewEntries(sample);
 return`<div class="sample-paper sample-${theme.id}" style="--sample-accent:${theme.color}"><div class="sample-head"><div><h3>${esc(v6SampleText(sample.name))}</h3><p>${esc(v6SampleText(sample.headline))}</p><small>${esc(sample.email)}　${esc(v6SampleText(sample.location))}</small></div><div class="sample-avatar">${esc(initials)}</div></div>${entries.map(e=>`<section class="sample-section"><h4>${esc(v6SampleText(e.section==='education'?bi('教育背景','Education'):e.section==='work'?bi('工作经历','Experience'):bi('项目经历','Projects')))}</h4><div class="sample-entry"><header><b>${esc(v6SampleText(e.title))}</b><span>${esc(e.date)}</span></header><p>${esc(v6SampleText(e.role))}</p><ul>${e.bullets.slice(0,2).map(b=>`<li>${esc(b[0])}</li>`).join('')}</ul></div></section>`).join('')}<section class="sample-section"><h4>个人技能</h4><p>${esc(v6SampleText(sample.entries.find(e=>e.section==='skills')?.role||bi('经营管理 · 项目执行','Operations · Project Delivery')))}</p></section></div>`;
}
function v6SampleForTheme(index){return V6_SAMPLES[index%V6_SAMPLES.length]}
function v6SampleCard(theme,index,context='home'){
 const sample=v6SampleForTheme(index);
 return`<article class="template-option" data-theme-card="${esc(theme.id)}"><div class="sample-paper-wrap">${v6SamplePreview(theme,sample)}</div><div class="template-option-side"><h3>${esc(theme.name)}</h3><p>${esc(theme.desc)}</p><div class="template-action-row"><button class="primary" data-open-sample="${esc(sample.id)}" data-sample-theme="${esc(theme.id)}">使用模板</button></div></div></article>`;
}
async function v6OpenSample(sampleId,themeId){const sample=V6_SAMPLE_MAP[sampleId],theme=THEMES.find(t=>t.id===themeId)||THEMES[0];if(!sample)return;try{const p=await addProject(v6SampleText(sample.name)+' · '+theme.name+' 示例',v6SampleWorkspace(sample,theme));$('#editor')?.close();await showProject(p.id);toast('已打开比奇堡示例项目，可直接编辑')}catch(e){toast('示例项目打开失败：'+e.message)}}

/* Keep the folio preview honest: show the same primary/secondary split used by
   the editor instead of rendering the sample as a single-column card. */
function v6SamplePreview(theme,sample){
  const entries=v6PreviewEntries(sample),skills=sample.entries.find(e=>e.section==='skills');
  const label=e=>e.section==='education'?bi('教育背景','Education'):e.section==='work'?bi('工作经历','Experience'):bi('项目经历','Projects');
  const section=e=>`<section class="sample-section"><h4>${esc(v6SampleText(label(e)))}</h4><div class="sample-entry"><header><b>${esc(v6SampleText(e.title))}</b><span>${esc(e.date)}</span></header><p>${esc(v6SampleText(e.role))}</p><ul>${e.bullets.slice(0,2).map(b=>`<li>${esc(b[0])}</li>`).join('')}</ul></div></section>`;
  const normal=entries.map(section).join('');
  const body=theme.id==='folio'?`<div class="sample-columns"><div class="sample-primary">${entries.filter(e=>e.section!=='projects').map(section).join('')}${skills?`<section class="sample-section"><h4>个人技能</h4><p>${esc(v6SampleText(skills.role))}</p></section>`:''}</div><div class="sample-secondary">${entries.filter(e=>e.section==='projects').map(section).join('')}</div></div>`:`${normal}${skills?`<section class="sample-section"><h4>个人技能</h4><p>${esc(v6SampleText(skills.role))}</p></section>`:''}`;
  return`<div class="sample-paper sample-${theme.id}" style="--sample-accent:${theme.color}"><div class="sample-head"><div><h3>${esc(v6SampleText(sample.name))}</h3><p>${esc(v6SampleText(sample.headline))}</p><small>${esc(sample.email)}　${esc(v6SampleText(sample.location))}</small></div><div class="sample-avatar">${sample.photo?`<img src="${esc(sample.photo)}" alt="${esc(v6SampleText(sample.name))}">`:esc(sample.avatar)}</div></div>${body}</div>`;
}
function v6StableNewProjectDialog(themeId='blue'){
 const choices=[...projects.values()].filter(p=>!p.archived);openDialog(`<h2>新建简历项目</h2><p class="project-import-note">项目彼此独立；一个项目里可以有多个岗位版本。</p><form><div class="form-grid">${field('项目名称','projectName','',true)}${field('姓名（新建空白项目时使用）','owner','',true)}<label class="field wide">起点<select name="startingPoint"><option value="blank">空白项目</option>${choices.map(p=>`<option value="${esc(p.id)}">复制：${esc(p.name)}</option>`).join('')}</select></label><label class="field wide">初始模板<select name="theme">${THEMES.map(t=>`<option value="${esc(t.id)}" ${t.id===themeId?'selected':''}>${esc(t.name)} — ${esc(t.desc)}</option>`).join('')}</select></label></div><div class="dialog-actions"><button type="button" data-close>取消</button><button class="primary">创建并打开</button></div></form>`,d=>{
   const name=String(d.get('projectName')).trim(),owner=String(d.get('owner')).trim(),theme=THEMES.find(t=>t.id===d.get('theme'))||THEMES[0],source=projects.get(d.get('startingPoint'));const data=source?clone(source.data):blankWorkspace(owner,theme);const current=data.versions.find(w=>w.id===data.active);if(current){current.style.template=theme.id;current.style.accent=theme.color;current.style.page=current.style.page||{kind:'A4',width:210,height:297}}addProject(name||((owner||'未命名')+'的简历'),data).then(p=>showProject(p.id)).catch(e=>toast('项目创建失败：'+e.message));
 });$('#editor [name="projectName"]').placeholder='例如：我的简历';
}
newProjectDialog=v6StableNewProjectDialog;
const v6BlankWorkspace=blankWorkspace;blankWorkspace=function(owner,theme){const data=v6BlankWorkspace(owner,theme);const w=data.versions[0];w.name='版本 1';w.courses={...w.courses,enabled:true,autoLink:true,selected:[]};w.style.page={kind:'A4',width:210,height:297};return data};
function v6RenderHome(){
 const archived=homeView==='archived',templates=homeView==='templates';const list=[...projects.values()].filter(p=>Boolean(p.archived)===archived&&(`${p.name} ${projectPerson(p)}`).toLowerCase().includes(homeSearch.toLowerCase())).sort((a,b)=>homeSort==='name'?a.name.localeCompare(b.name,'zh-CN'):b.updatedAt.localeCompare(a.updatedAt));const count=[...projects.values()].filter(p=>!p.archived).length;
 const heading=templates?'模板与示例':archived?'已归档项目':'我的简历项目';
 const templateMarkup=templates?`<div class="template-stack v6-template-stack">${THEMES.map((t,i)=>v6SampleCard(t,i,'home')).join('')}</div>`:`<div class="home-tools"><span>${archived?'归档项目可以随时恢复。':'全部项目 · '+list.length+' 个'}</span><div class="row"><input id="projectSearch" placeholder="搜索项目或姓名" value="${esc(homeSearch)}"><select id="projectSort"><option value="updated" ${homeSort==='updated'?'selected':''}>最近修改</option><option value="name" ${homeSort==='name'?'selected':''}>按项目名称</option></select></div></div><div class="project-grid">${list.map(p=>{const t=projectTheme(p);return`<article class="project-card"><button class="project-cover" data-open-project="${esc(p.id)}" aria-label="打开 ${esc(p.name)}">${miniature(t,projectPerson(p),t.name)}</button><div class="project-card-info"><div class="project-title-line"><h3>${esc(p.name)}</h3><button class="project-menu" data-manage-project="${esc(p.id)}" aria-label="管理 ${esc(p.name)}">···</button></div><div class="project-stats">${p.data.versions.length} 个版本 <span style="margin:0 5px;color:#c8cdd3">/</span> ${p.data.entries.length} 条经历</div><div class="project-meta"><span class="project-tag">${esc(t.name)}</span><span>${relativeDate(p.updatedAt)}</span></div></div></article>`}).join('')}${!archived?'<button class="project-create" id="createCard"><span class="plus">＋</span><span>创建新的简历项目</span><small>从空白开始，或复制已有项目</small></button>':!list.length?'<div class="home-empty">还没有归档项目</div>':''}</div>`;
   document.body.dataset.mode='home';document.title='我的简历项目';$('#projectHome').innerHTML=`<div class="home-top"><div class="home-breadcrumb">个人工作区 <span style="margin:0 12px;color:#ced3d9">/</span> <b>${esc(heading)}</b></div><span class="local-badge">● 本地保存</span></div><div class="home-layout"><nav class="home-nav"><p class="nav-label">WORKSPACE</p><button data-home-view="projects" class="${homeView==='projects'?'active':''}">▤　我的项目 <span style="float:right;font-size:11px">${count}</span></button><button data-home-view="templates" class="${templates?'active':''}">▦　模板与示例</button><button data-home-view="archived" class="${archived?'active':''}">⌑　已归档</button><div class="nav-bottom">每个项目独立保存<br>文件可携带整个简历库<br><br>无需登录 · 无需联网</div></nav><div class="home-content"><div class="home-intro"><div><div class="eyebrow">${templates?'LAYOUTS & SAMPLE RESUMES':'YOUR RESUME PROJECTS'}</div><h1>${esc(heading)}</h1><p>${templates?'先看真实人物示例，再决定使用哪种排版。':'一份项目保存完整经历，为每次投递组合合适的版本。'}</p></div><div class="actions"><button id="homeOpenFile">↗ 打开项目文件</button><button id="homeNewProject" class="primary">＋ 新建项目</button><button id="chooseTemplate">模板与示例</button></div></div>${templateMarkup}<div class="home-guide"><strong>项目文件可带走</strong><p>“保存项目文件”导出可继续编辑的 .resume.json；“导出”用于生成 PDF、静态 HTML 或长图。</p></div></div></div>`;
   $$('[data-home-view]').forEach(el=>el.onclick=()=>{homeView=el.dataset.homeView;homeSearch='';v6RenderHome()});$('#homeNewProject').onclick=()=>newProjectDialog();$('#homeOpenFile').onclick=()=>openExisting();$('#chooseTemplate').onclick=()=>v6ShowTemplatePicker();if($('#createCard'))$('#createCard').onclick=()=>newProjectDialog();if($('#projectSearch'))$('#projectSearch').oninput=e=>{const pos=e.target.selectionStart;homeSearch=e.target.value;v6RenderHome();$('#projectSearch').focus();$('#projectSearch').setSelectionRange(pos,pos)};if($('#projectSort'))$('#projectSort').onchange=e=>{homeSort=e.target.value;v6RenderHome()};$$('[data-open-project]').forEach(el=>el.onclick=()=>showProject(el.dataset.openProject));$$('[data-manage-project]').forEach(el=>el.onclick=()=>manageProject(el.dataset.manageProject));$$('[data-open-sample]').forEach(el=>el.onclick=()=>v6OpenSample(el.dataset.openSample,el.dataset.sampleTheme));
}
renderHome=v6RenderHome;
function v6ShowTemplatePicker(){openDialog(`<h2>选择模板</h2><p class="hint">每张卡直接打开一份可编辑的比奇堡人物简历；模板会作为这份简历的排版。</p><div class="template-stack v6-template-stack">${THEMES.map((t,i)=>v6SampleCard(t,i,'dialog')).join('')}</div><div class="dialog-actions"><button data-close>取消</button></div>`);$('#editor').classList.add('template-picker');$('#editor').addEventListener('close',()=>$('#editor').classList.remove('template-picker'),{once:true});$$('[data-open-sample]').forEach(b=>b.onclick=()=>v6OpenSample(b.dataset.openSample,b.dataset.sampleTheme))}
chooseTemplate=v6ShowTemplatePicker;

/* Built-in character photos live beside the static app.  Accepting a relative
   asset path here lets the bundled Bikini Bottom samples render their photos
   both from file:// and from GitHub Pages, while uploaded photos still use
   data URLs exactly as before. */
renderPhoto=function(){const p=profile(),s=v().style,f=s.photoLayout;if(!s.photo||!p.photo)return'';return`<div class="photo-box" title="拖动照片改变位置；双击裁剪" style="left:${f.x}mm;top:${f.y}mm;width:${f.width}mm;height:${f.height}mm;--photo-radius:${f.radius}px"><img alt="个人照片" src="${esc(p.photo)}" draggable="false" style="${cropImageStyle(f)}"><span class="photo-tip">拖动位置 · 双击裁剪</span></div>`};

/* Explicit migration/normalization keeps old project files valid while removing dangling references. */
const v6MigrateBase=migrateV2;migrateV2=function(){v6MigrateBase();const entryIds=new Set(state.entries.map(e=>e.id)),bulletIds=new Set(state.entries.flatMap(e=>e.bullets.map(b=>b.id))),sectionIds=new Set(state.sections.map(s=>s.id));state.versions.forEach(w=>{const oldOrder=Array.isArray(w.order)?w.order:[];w.order=[...new Set(oldOrder.filter(id=>entryIds.has(id)))];w.hidden=[...new Set((w.hidden||[]).filter(id=>entryIds.has(id)))];w.hiddenBullets=[...new Set((w.hiddenBullets||[]).filter(id=>bulletIds.has(id)))];Object.keys(w.overrides||{}).forEach(id=>{if(!entryIds.has(id))delete w.overrides[id]});const previous=Array.isArray(w.sectionOrder)?w.sectionOrder:[];w.sectionOrder=[...new Set(previous.filter(id=>sectionIds.has(id))),...state.sections.map(s=>s.id).filter(id=>!previous.includes(id))];w.style.page=w.style.page||{kind:'A4',width:210,height:297};if(w.courses){w.courses.selected=Array.isArray(w.courses.selected)?w.courses.selected.filter(id=>state.courses.some(c=>c.id===id)):[];if(w.courses.educationId&&!entryIds.has(w.courses.educationId))w.courses.educationId=state.entries.find(e=>e.section==='education')?.id||'';if(w.courses.autoLink===undefined)w.courses.autoLink=state.workspaceKind==='blank'||state.workspaceKind==='sample'}})};
/* The grade library is shared by every version.  There is no second per-version
   selection step: once a course is in the library it is linked to each version,
   while showScore stays a per-course flag. */
const v6MigrateCourseBase=migrateV2;
migrateV2=function(){
  v6MigrateCourseBase();
  const courses=Array.isArray(state.courses)?state.courses:[],ids=courses.map(c=>c.id);
  state.versions.forEach(w=>{
    w.courses=w.courses||clone(courseDefaults);
    w.courses.enabled=true;
    w.courses.autoLink=true;
    /* Initialize legacy versions once, but never re-add a course that the user
       deliberately unchecked in the grade library. */
    w.courses.selected=Array.isArray(w.courses.selected)?[...new Set(w.courses.selected.filter(id=>ids.includes(id)))]:[...ids];
    if(!w.courses.educationId)w.courses.educationId=state.entries.find(e=>e.section==='education')?.id||'';
  });
};
function v6SectionOrder(version=v()){const ids=state.sections.map(s=>s.id),previous=Array.isArray(version.sectionOrder)?version.sectionOrder:[];return[...new Set([...previous.filter(id=>ids.includes(id)),...ids.filter(id=>!previous.includes(id))])];}
function v6WithSectionOrder(fn){const original=state.sections,orderedIds=v6SectionOrder();const map=new Map(state.sections.map(s=>[s.id,s]));state.sections=orderedIds.map(id=>map.get(id)).filter(Boolean);try{return fn()}finally{state.sections=original}}
const v6FoldedVersions=new Set();
const v6ShowProjectBase=showProject;
showProject=async function(id){v6FoldedVersions.clear();return v6ShowProjectBase(id)};
const v6SidebarBase=renderSidebar;
renderSidebar=function(){
  const versionId=v().id;
  if(!v6FoldedVersions.has(versionId)){state.sections.forEach(s=>folded.add(s.id));v6FoldedVersions.add(versionId)}
  v6WithSectionOrder(v6SidebarBase);
  if(styleOpen||tab!=='current')return;
  let draggingSection='';
  $$('.section .section-head').forEach(head=>{
    const sid=head.querySelector('[data-new]')?.dataset.new;
    if(!sid)return;
    head.dataset.sectionDrag=sid;
    let handle=head.querySelector('.section-drag-handle');
    if(!handle){
      head.insertAdjacentHTML('beforeend','<span class="section-drag-handle" draggable="true" title="拖动调整模块顺序">⠿</span>');
      handle=head.querySelector('.section-drag-handle');
    }else{
      /* Keep the grab handle at the far right even after each sidebar rerender. */
      head.append(handle);
    }
    handle.onclick=e=>e.stopPropagation();
    const section=head.closest('.section');
    handle.ondragstart=e=>{draggingSection=sid;e.dataTransfer.setData('text/plain',sid);head.classList.add('section-dragging');section?.classList.add('section-dragging')};
    handle.ondragend=()=>{$$('.section-dragging,.section-drag-over').forEach(el=>el.classList.remove('section-dragging','section-drag-over'))};
    head.ondragover=e=>{if(draggingSection&&draggingSection!==sid){e.preventDefault();section?.classList.add('section-drag-over')}};
    head.ondragleave=()=>section?.classList.remove('section-drag-over');
    head.ondrop=e=>{
      e.preventDefault();
      $$('.section-dragging,.section-drag-over').forEach(el=>el.classList.remove('section-dragging','section-drag-over'));
      const from=e.dataTransfer.getData('text/plain')||draggingSection;
      if(!from||from===sid)return;
      change(()=>{
        const order=v6SectionOrder(),a=order.indexOf(from),b=order.indexOf(sid);
        if(a<0||b<0)return;
        order.splice(a,1);order.splice(order.indexOf(sid),0,from);v().sectionOrder=order;
      });
    };
  });
};
const v6PaperBase=renderPaper;renderPaper=function(){v6WithSectionOrder(v6PaperBase)};

function v6CleanupEntryRefs(entries){const ids=new Set(entries.map(e=>e.id)),bullets=new Set(entries.flatMap(e=>e.bullets.map(b=>b.id)));state.versions.forEach(w=>{w.order=(w.order||[]).filter(id=>!ids.has(id));w.hidden=(w.hidden||[]).filter(id=>!ids.has(id));w.hiddenBullets=(w.hiddenBullets||[]).filter(id=>!bullets.has(id));ids.forEach(id=>delete w.overrides[id]);if(ids.has(w.courses?.educationId))w.courses.educationId=state.entries.find(e=>e.section==='education'&&!ids.has(e.id))?.id||''})}
function v6RemoveEntryEverywhere(id){const target=state.entries.find(e=>e.id===id);if(!target)return;v6CleanupEntryRefs([target]);state.entries=state.entries.filter(e=>e.id!==id)}
editEntry=function(id,section){const raw=state.entries.find(e=>e.id===id),libraryMode=tab==='library',e=raw?clone(libraryMode?raw:resolved(raw)):entry(uid(),section,bi('',''),bi('',''),'',[]);openDialog(`<h2>${id?'编辑经历':'添加经历'}</h2><p class="hint">${libraryMode?'修改简历库，未单独编辑的版本会同步。':'修改当前版本；新增经历会进入经历库，并默认只加入当前版本。'} 中英文描述按行对应。</p><form><div class="form-grid">${field('中文标题','zh',e.title.zh)}${field('英文标题','en',e.title.en)}${field('中文角色 / 奖项','roleZh',e.role.zh)}${field('英文角色 / 奖项','roleEn',e.role.en)}${field('日期','date',e.date,true)}${field('中文描述（每行一条）','bulletsZh',e.bullets.map(b=>b.text.zh).join('\n'),true,true)}${field('英文描述（与中文逐行对应）','bulletsEn',e.bullets.map(b=>b.text.en).join('\n'),true,true)}</div><div class="dialog-actions">${id?'<button type="button" class="danger" id="deleteEntry">删除</button>':''}${id&&v().overrides[id]&&!libraryMode?'<button type="button" id="resetEntry">恢复库中原文</button>':''}<button type="button" data-close>取消</button><button class="primary">保存经历</button></div></form>`,data=>{const zh=String(data.get('bulletsZh')).split('\n'),en=String(data.get('bulletsEn')).split('\n');e.title=bi(data.get('zh'),data.get('en'));e.role=bi(data.get('roleZh'),data.get('roleEn'));e.date=data.get('date');e.bullets=Array.from({length:Math.max(zh.length,en.length)},(_,i)=>({id:e.bullets[i]?.id||uid(),text:bi(zh[i]||'',en[i]||'')})).filter(b=>b.text.zh||b.text.en);change(()=>{if(!raw){state.entries.push(e);if(libraryMode){state.versions.forEach(w=>{w.hidden=w.hidden||[];if(!w.hidden.includes(e.id))w.hidden.push(e.id)})}else{const current=v();current.order=current.order||[];if(!current.order.includes(e.id))current.order.push(e.id);state.versions.forEach(w=>{if(w.id!==current.id){w.hidden=w.hidden||[];if(!w.hidden.includes(e.id))w.hidden.push(e.id)}})}}else if(libraryMode)state.entries[state.entries.indexOf(raw)]=e;else v().overrides[id]=e})});if($('#deleteEntry'))$('#deleteEntry').onclick=()=>{if(libraryMode){if(!confirm('从简历库及所有版本中删除这条经历？可以使用撤销恢复。'))return;change(()=>v6RemoveEntryEverywhere(id));$('#editor').close();toast('已从库中删除，可撤销')}else{change(()=>{v().hidden=v().hidden||[];if(!v().hidden.includes(id))v().hidden.push(id)});$('#editor').close();toast('已从当前版本移除，经历库中仍保留')}};if($('#resetEntry'))$('#resetEntry').onclick=()=>{change(()=>delete v().overrides[id]);$('#editor').close()}};
editModule=function(id){const sec=state.sections.find(s=>s.id===id);if(!sec)return;const entries=state.entries.filter(e=>e.section===id),currentName=v().sectionNames[id]?.[lang()]||text(sec.name)||sec.name.zh;openDialog('<h2>编辑模块</h2><form><div class="form-grid">'+field('模块名称','name',currentName,true)+'</div><p class="hint">'+(entries.length?'此模块包含 '+entries.length+' 条经历。删除模块会同时删除其中经历，可用撤销恢复。':'空模块可以直接删除。')+'</p><div class="dialog-actions"><button type="button" class="danger module-delete" id="deleteModule">删除该模块</button><button type="button" data-close>取消</button><button class="primary">保存</button></div></form>',d=>change(()=>{const name=String(d.get('name')).trim();if(tab==='library')sec.name=bi(name||sec.name.zh,name||sec.name.en);else v().sectionNames[id]={...(v().sectionNames[id]||sec.name),[lang()]:name||currentName}}));$('#deleteModule').onclick=()=>{if(!confirm('删除“'+currentName+'”模块'+(entries.length?'及其中 '+entries.length+' 条经历':'')+'？删除后可使用撤销恢复。'))return;change(()=>{v6CleanupEntryRefs(entries);state.sections=state.sections.filter(s=>s.id!==id);state.entries=state.entries.filter(e=>e.section!==id);state.versions.forEach(w=>{delete w.sectionNames[id];w.sectionOrder=(w.sectionOrder||[]).filter(x=>x!==id)})});$('#editor').close();toast('模块已删除，可撤销')};};

/* Grade library remains the single editor; newly added courses auto-link to versions created here. */
const v6EditCourseBase=editCourse;editCourse=function(id){const existing=state.courses.find(c=>c.id===id),c=clone(existing||{id:uid(),name:bi('',''),score:'',status:'pending',credits:0,term:''});$('#editor').close();openDialog(`<h2>${id?'编辑':'新增'}课程</h2><form><div class="form-grid">${field('课程名称','zh',c.name.zh,true)}${field('英文名称（选填）','en',c.name.en,true)}${field('成绩（选填，可填“通过”）','score',c.status==='pass'?'通过':c.score,true)}</div><div class="dialog-actions"><button type="button" data-close>取消</button><button class="primary">保存</button></div></form>`,d=>{if(!String(d.get('zh')).trim()&&!String(d.get('en')).trim())return toast('请输入课程名称');const score=String(d.get('score')).trim();change(()=>{c.name=bi(String(d.get('zh')).trim(),String(d.get('en')).trim());c.status=/^(P|Pass|通过)$/i.test(score)?'pass':score?'graded':'pending';c.score=c.status==='pass'?'P':score;if(existing)state.courses[state.courses.indexOf(existing)]=c;else{state.courses.push(c);state.versions.forEach(w=>{w.courses=w.courses||{...clone(courseDefaults),selected:[]};if(w.courses.autoLink){w.courses.enabled=true;w.courses.selected=w.courses.selected||[];if(!w.courses.selected.includes(c.id))w.courses.selected.push(c.id);if(!w.courses.educationId)w.courses.educationId=state.entries.find(e=>e.section==='education')?.id||''}})}});setTimeout(showCourses,0)})};

/* Restore the original version manager: rename and delete remain available. */
$('#versionMenu').textContent='⋯';$('#versionMenu').title='重命名或删除版本';$('#versionMenu').onclick=()=>{openDialog(`<h2>管理当前版本</h2><form><div class="form-grid">${field('版本名称','name',v().name,true)}</div><div class="dialog-actions"><button type="button" class="danger" id="deleteVersion">删除版本</button><button type="button" data-close>取消</button><button class="primary">保存</button></div></form>`,d=>change(()=>v().name=String(d.get('name')).trim()||v().name));$('#deleteVersion').onclick=()=>{if(state.versions.length===1)return toast('至少保留一个版本');if(!confirm('删除当前版本？经历库会保留。'))return;change(()=>{state.versions=state.versions.filter(w=>w.id!==state.active);state.active=state.versions[0].id});$('#editor').close()}};
/* Keep the public entry screen in the requested v4 shape: exactly two choices. */
renderHome=v6SimpleHome;
if(projectDB)renderHome();
/* v8: keep the v4 entry screen while tightening the remaining project and
   editor interactions.  These overrides are intentionally additive so old
   .resume.json files continue to load. */
const v8PageConfig=pageConfig;
pageConfig=function(){
  const c=v()?.style?.page||{kind:'A4',width:210,height:297};
  const requested=c.kind==='custom'?'A4':c.kind;
  const kind=[...Object.keys(pagePresets),'long'].includes(requested)?requested:'A4';
  const preset=pagePresets[kind];
  if(preset)return{kind,width:preset[0],height:preset[1]};
  return{kind,width:clamp(c.width,100,420,210),height:0};
};

function v8CleanPageControls(){
  ['#pageQuickKind','#pageKind'].forEach(selector=>{
    const select=$(selector);if(!select)return;
    select.querySelector('option[value="custom"]')?.remove();
    if(!['A4','A5','A3','long'].includes(select.value))select.value='A4';
  });
}
const v8RenderStyles=renderStyles;
renderStyles=function(){
  v8RenderStyles();
  v8CleanPageControls();
  const select=$('#pageKind');
  if(select)select.onchange=e=>change(()=>{
    const kind=e.target.value,c=pageConfig(),dimensions=pagePresets[kind]||[c.width,0];
    v().style.page={kind,width:dimensions[0],height:dimensions[1]};boundPhoto(v().style.photoLayout);
  });
};
v8CleanPageControls();

/* Built-in sample resumes should open once per character/layout, not create a
   new hidden duplicate on every click. */
const v8OpenSample=v6OpenSample;
v6OpenSample=async function(sampleId,themeId){
  const sample=V6_SAMPLE_MAP[sampleId],theme=THEMES.find(t=>t.id===themeId)||THEMES[0];
  if(!sample)return;
  const existing=[...projects.values()].find(p=>p.data?.sampleId===sample.id&&p.data?.versions?.some(w=>w.style?.template===theme.id));
  if(existing){$('#editor')?.close();await showProject(existing.id);toast('已打开现有比奇堡示例项目，可直接编辑');return;}
  return v8OpenSample(sampleId,themeId);
};

/* Modern sidebar: education and skills are the visible left rail; all
   experience sections occupy a clearly separated right column. */
const v8PaperBase=renderPaper;
renderPaper=function(){
  v8PaperBase();
  const paper=$('#paper');
  if(!paper||v().style.template!=='sidebar')return;
  const columns=paper.querySelector(':scope > .cv-columns')||document.createElement('div');
  const sections=[...new Set([
    ...paper.querySelectorAll(':scope > .cv-section'),
    ...columns.querySelectorAll(':scope > .cv-section, :scope > .cv-secondary > .cv-section, :scope > .cv-primary > .cv-section')
  ])];
  if(!sections.length)return;
  columns.className='cv-columns cv-sidebar-columns';
  const secondary=document.createElement('div'),primary=document.createElement('div');
  secondary.className='cv-secondary';primary.className='cv-primary';
  sections.forEach(section=>{
    const id=section.querySelector('[data-field="section"]')?.dataset.id;
    (['education','skills'].includes(id)?secondary:primary).append(section);
  });
  columns.replaceChildren(secondary,primary);
  paper.append(columns);
  requestAnimationFrame(measure);
};

/* Keep the template cards honest too: the sidebar card previews the same split
   used by the editor, while the other themes retain their own layout. */
const v8SamplePreviewBase=v6SamplePreview;
v6SamplePreview=function(theme,sample){
  if(theme.id!=='sidebar')return v8SamplePreviewBase(theme,sample);
  const entries=v6PreviewEntries(sample),skills=sample.entries.find(e=>e.section==='skills');
  const label=e=>e.section==='education'?bi('教育背景','Education'):e.section==='work'?bi('工作经历','Experience'):bi('项目经历','Projects');
  const section=e=>`<section class="sample-section"><h4>${esc(v6SampleText(label(e)))}</h4><div class="sample-entry"><header><b>${esc(v6SampleText(e.title))}</b><span>${esc(e.date)}</span></header><p>${esc(v6SampleText(e.role))}</p><ul>${e.bullets.slice(0,2).map(b=>`<li>${esc(b[0])}</li>`).join('')}</ul></div></section>`;
  const left=entries.filter(e=>e.section==='education').map(section).join('')+(skills?`<section class="sample-section"><h4>个人技能</h4><p>${esc(v6SampleText(skills.role))}</p></section>`:'');
  const right=entries.filter(e=>e.section!=='education').map(section).join('');
  return`<div class="sample-paper sample-sidebar" style="--sample-accent:${theme.color}"><div class="sample-head"><div><h3>${esc(v6SampleText(sample.name))}</h3><p>${esc(v6SampleText(sample.headline))}</p><small>${esc(sample.email)}　${esc(v6SampleText(sample.location))}</small></div><div class="sample-avatar">${sample.photo?`<img src="${esc(sample.photo)}" alt="${esc(v6SampleText(sample.name))}">`:esc(sample.avatar)}</div></div><div class="sample-columns sample-sidebar-columns"><div class="sample-secondary">${left}</div><div class="sample-primary">${right}</div></div></div>`;
};

/* No copy/archive controls in the v4 flow.  Creating a project always starts
   from a clean workspace and a chosen visual template. */
function v8NewProjectDialog(themeId='blue'){
  const theme=THEMES.find(t=>t.id===themeId)||THEMES[0];
  openDialog(`<h2>从已有模板创建</h2><p class="project-import-note">选择排版，填写姓名后即可打开一份可编辑项目。</p><form><div class="form-grid">${field('项目名称','projectName','',true)}${field('姓名','owner','',true)}<label class="field wide">模板<select name="theme">${THEMES.map(t=>`<option value="${esc(t.id)}" ${t.id===theme.id?'selected':''}>${esc(t.name)} — ${esc(t.desc)}</option>`).join('')}</select></label></div><div class="dialog-actions"><button type="button" data-close>取消</button><button class="primary">创建并打开</button></div></form>`,d=>{
    const name=String(d.get('projectName')).trim(),owner=String(d.get('owner')).trim(),selectedTheme=THEMES.find(t=>t.id===d.get('theme'))||THEMES[0];
    addProject(name||((owner||'未命名')+'的简历'),blankWorkspace(owner,selectedTheme)).then(p=>showProject(p.id)).catch(e=>toast('项目创建失败：'+e.message));
  });
  $('#editor [name="projectName"]')?.focus();
}
newProjectDialog=v8NewProjectDialog;

function v8ManageProject(id){
  const record=projects.get(id);if(!record)return;
  openDialog(`<h2>项目名称</h2><form><div class="form-grid">${field('项目名称','name',record.name,true)}</div><p class="hint">项目文件可从编辑页顶部“保存项目文件”导出。</p><div class="dialog-actions"><button type="button" data-close>取消</button><button class="primary">保存名称</button></div></form>`,d=>{
    const name=String(d.get('name')).trim();if(!name)return;
    queueWrite(async()=>{const current=projects.get(id),saved=await databasePut({...current,name,updatedAt:new Date().toISOString()},current.revision);projects.set(id,saved);if(activeProjectId===id)$('#projectName').textContent=name}).catch(e=>toast(e.message));
  });
}
manageProject=v8ManageProject;
$('#projectName').onclick=()=>v8ManageProject(activeProjectId);

/* The saved-state pill is not part of the v4 UI. */
$('#saveState')?.setAttribute('hidden','');

/* Align the arrow and drag handle, and expose an explicit selected state for
   the photo's left/right segmented control. */
const v8EditPhotoBase=editPhoto;
editPhoto=function(){
  v8EditPhotoBase();
  const left=$('#photoLeft'),right=$('#photoRight');
  if(!left||!right)return;
  left.classList.add('photo-align-option');right.classList.add('photo-align-option');
  const select=which=>{left.classList.toggle('selected',which==='left');right.classList.toggle('selected',which==='right')};
  left.addEventListener('click',()=>select('left'));right.addEventListener('click',()=>select('right'));
  const layout=v().style.photoLayout||{},frame=typeof bodyWidth==='function'?bodyWidth():0;
  select(Number(layout.x)>=frame-Number(layout.width)-.5?'right':'left');
};

/* Remove the phrase “修改当前版本” from the already-built experience dialog
   without changing the library/current-version behavior. */
const v8EditEntryBase=editEntry;
editEntry=function(...args){
  const result=v8EditEntryBase(...args),hint=$('#editor .hint');
  if(hint)hint.textContent=hint.textContent.replace('修改当前版本；','');
  return result;
};

function v8AiPrompt(){return`请严格按照下载的 JSON 样例填充一份可编辑简历。\n\n要求：\n1. 保留 kind、formatVersion、data、schema、sections、versions、active 及所有字段层级；不要改字段名。\n2. 中英文内容逐条对应：中文写入 zh，英文写入 en；日期、机构、职位与项目名称保持语义一致。\n3. 每条经历必须使用唯一 id，并通过 section 归入 education、work、projects、awards 或 skills；描述按一条一个 bullet 写入。\n4. 只补充或修改简历内容与个人信息，不删除排版设置、版本结构、课程库或照片字段。\n5. 返回完整 JSON 文件，不要 Markdown 代码块、解释文字或额外字段。`}
function v8DownloadAiSample(){
  const theme=THEMES.find(t=>t.id==='blue')||THEMES[0],data=blankWorkspace('',theme),record={name:'AI简历填写样例',data};
  download('AI简历填写样例.resume.json',JSON.stringify(portable(record,data),null,2),'application/json');toast('已下载 AI 填写样例');
}
function v8ShowAiTemplate(){
  openDialog(`<h2>用 AI 填写简历</h2><p class="hint">下载样例后，把下面的提示词、JSON，还有你的个人信息/已有简历一起交给 AI；完成后从首页“导入 JSON”打开。</p><textarea id="aiPromptText" readonly style="width:100%;min-height:220px;margin-top:14px;line-height:1.7">${esc(v8AiPrompt())}</textarea><div class="dialog-actions"><span id="copyAiStatus" class="copy-ai-status" aria-live="polite"></span><button type="button" id="copyAiPrompt">复制提示词</button><button type="button" class="primary" id="downloadAiJson">下载样例 JSON</button></div>`);
  const copied=()=>{$('#copyAiStatus').textContent='提示词已复制';$('#copyAiPrompt').focus()};
  $('#copyAiPrompt').onclick=async()=>{try{await navigator.clipboard.writeText(v8AiPrompt());copied()}catch(e){$('#aiPromptText').select();document.execCommand('copy');copied()}};
  $('#downloadAiJson').onclick=()=>v8DownloadAiSample();
}

/* Return-home confirmation: leave without saving or download the current
   .resume.json first. */
const v8LeaveHome=async()=>{document.activeElement?.blur();await writeQueue;activeProjectId=null;history=[];document.body.dataset.mode='home';document.title='我的简历项目';try{projects=new Map((await databaseAll()).map(p=>[p.id,p]))}catch(e){}renderHome()};
goHome=async function(){
  if(!activeProjectId)return v8LeaveHome();
  const record=projects.get(activeProjectId);if(!record)return v8LeaveHome();
  openDialog(`<h2>返回首页</h2><p class="hint">要先保存当前简历项目文件吗？不保存也可以直接返回首页。</p><div class="dialog-actions"><button type="button" id="leaveWithoutSave">直接返回</button><button type="button" class="primary" id="saveAndHome">保存项目文件并返回</button></div>`);
  $('#leaveWithoutSave').onclick=()=>{$('#editor').close();v8LeaveHome()};
  $('#saveAndHome').onclick=async()=>{await save();const latest=projects.get(activeProjectId)||record;download(projectFilename(latest.name),JSON.stringify(portable(latest,state),null,2),'application/json');toast('项目文件已保存');$('#editor').close();await v8LeaveHome()};
};
$('#backToProjects').onclick=goHome;

/* Replace the final v4 start screen with a compact, welcoming two-choice
   surface.  Import remains a local .resume.json file picker. */
v6SimpleHome=function(){
  document.body.dataset.mode='home';document.title='ResuWeave';
  $('#projectHome').innerHTML=`<div class="start-shell"><div class="welcome-copy"><h1>欢迎！开始整理你的简历吧</h1></div><div class="start-grid"><section class="start-card"><h1>打开已有文件</h1><div class="drop-target" id="openResume" role="button" tabindex="0" aria-label="打开简历项目文件"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 15V9h13l5 6h16v25H7z"/><path d="M7 20h34"/></svg><span>选择项目文件，或拖到这里</span><small>.resume.json · 继续编辑</small></div></section><section class="start-card"><h1>从已有模板创建</h1><div class="start-previews">${['blue','classic','sidebar'].map((id,i)=>{const t=THEMES.find(t=>t.id===id),s=v6SampleForTheme(i);return`<div class="start-sample-preview"><div class="sample-thumb">${v6SamplePreview(t,s)}</div></div>`}).join('')}</div><button class="primary" id="chooseTemplate">选择模板 →</button><div class="start-card-tools"><button type="button" id="downloadAiSample">下载 AI 填写样例</button><button type="button" id="importJson">导入 JSON</button></div></section></div></div>`;
  const drop=$('#openResume');drop.onclick=()=>openExisting();drop.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();openExisting()}};drop.ondragover=e=>{e.preventDefault();drop.classList.add('drag-over')};drop.ondragleave=()=>drop.classList.remove('drag-over');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('drag-over');if(e.dataTransfer.files[0])importResume(e.dataTransfer.files[0])};
  $('#chooseTemplate').onclick=()=>v6ShowTemplatePicker();$('#downloadAiSample').onclick=v8ShowAiTemplate;$('#importJson').onclick=()=>openExisting();
};
renderHome=v6SimpleHome;
if(projectDB)renderHome();
