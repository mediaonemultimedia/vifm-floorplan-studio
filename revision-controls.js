import {BOATS,revisionFor} from './projects.js';
import {escapeXML as e} from './model.js';
export function revisionControls(project,id,revision,available){
 const boat=BOATS.find(b=>b.id===id),entry=revisionFor(id,revision),select=document.querySelector('#revision-select');
 select.innerHTML=boat.revisions.filter(r=>available(r.id)).map(r=>`<option value="${r.id}">${e(r.label)}${r.readOnly?' · Archived':''}</option>`).join('');select.value=revision;
 document.querySelector('#revision-status').textContent=entry.readOnly?'Archived revision · view and export.':'Working revision · saved separately from earlier versions.';
 document.querySelector('#view-changes').textContent=project.revisionMeta?.changes?.length?'View change log':'Revision details';
 const readonly=entry.readOnly;if(readonly)document.querySelector('#save-status').textContent='Archived '+revision.toUpperCase()+' · preserved';
 document.querySelectorAll('#vessel-name,#length,#width,#page-size,#paper,#ink,#ink-hex,#palette button,#text-styles input,#line-styles input,[data-tool],#reset').forEach(el=>el.disabled=readonly);
 document.querySelector('#sheet').classList.toggle('archived',readonly);
}
export function showRevisionLog(project,readonly){
 const meta=project.revisionMeta;
 document.querySelector('#revision-title').textContent=`${project.name} / ${project.drawingRevision?.toUpperCase()||'V1'}`;
 document.querySelector('#revision-log').innerHTML=`<p class="revision-summary">${e(meta?.summary||'Initial working drawing.')} ${readonly?'This archived drawing is preserved for comparison and export.':''}</p>${meta?.date?`<p class="help">${e(meta.date)}</p>`:''}<ol class="change-log">${(meta?.changes||[]).map(c=>`<li><span class="change-state ${e(c.status)}">${c.status==='waiting'?'Needs information':c.status==='carried'?'Confirmed in V1':'Actioned'}</span><strong>${e(c.id)} · ${e(c.title)}</strong><p>${e(c.text)}</p>${c.sourceComment?`<p class="source-comment">Original PDF comment: <q>${e(c.sourceComment)}</q></p>`:''}</li>`).join('')}</ol>`;
 document.querySelector('#revision-dialog').showModal();
}
