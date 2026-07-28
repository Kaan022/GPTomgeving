(()=>{
  const nl=()=>((window.nextMatchLanguage?.()||localStorage.getItem('nextmatch-language')||'nl')==='nl');
  const T=(a,b)=>nl()?a:b;
  const lastEmail=()=>localStorage.getItem('nextmatch-last-email')||'';
  const baseUrl=()=>`${location.origin}${location.pathname}`;
  window.NM_PASSWORD_RECOVERY=new URLSearchParams(location.search).get('reset')==='1';
  const errorText=err=>{
    const s=String(err?.message||err||'');
    if(/invalid login credentials/i.test(s))return T('E-mailadres of wachtwoord klopt niet.','Email or password is incorrect.');
    if(/email not confirmed/i.test(s))return T('Bevestig eerst je e-mailadres via de ontvangen mail.','Confirm your email address first.');
    if(/rate limit/i.test(s))return T('Te veel pogingen. Wacht even en probeer opnieuw.','Too many attempts. Wait and try again.');
    return s;
  };
  const setMessage=(text,type='info')=>{const el=document.getElementById('auth-message');if(el)el.innerHTML=`<div class="auth-message ${type}">${e(text)}</div>`};
  window.togglePasswordVisibility=function(id='pass',button){const input=document.getElementById(id);if(!input)return;input.type=input.type==='password'?'text':'password';if(button)button.textContent=input.type==='password'?T('Tonen','Show'):T('Verbergen','Hide')};
  window.auth=function(){
    const reg=route==='register';
    const email=lastEmail();
    A.className='auth-page';
    A.innerHTML=`<main class="auth-shell">
      <section class="auth-story">
        <div class="auth-logo"><span>NM</span><b>NextMatch</b></div>
        <div class="auth-story-copy"><span class="auth-eyebrow">${T('Coach operating system','Coach operating system')}</span><h1>${T('Van wedstrijd naar trainingsveld.','From match to training pitch.')}</h1><p>${T('Leg vast wat je zag, neem één coachbesluit en deel een veldklaar trainingsschema met je staf.','Capture what you saw, make one coaching decision and share a field-ready session plan with your staff.')}</p></div>
        <div class="auth-cycle"><span>1 ${T('Reflecteren','Debrief')}</span><i></i><span>2 ${T('Beslissen','Decide')}</span><i></i><span>3 ${T('Trainen','Train')}</span></div>
      </section>
      <section class="auth-card-wrap"><form class="auth-card" onsubmit="event.preventDefault();authGo(${reg})">
        <div class="auth-mobile-logo"><span>NM</span><b>NextMatch</b></div>
        <span class="auth-eyebrow">${reg?T('Nieuwe workspace','New workspace'):T('Welkom terug','Welcome back')}</span>
        <h2>${reg?T('Maak je trainersaccount','Create your coach account'):T('Log in bij NextMatch','Sign in to NextMatch')}</h2>
        <p>${T('Na inloggen zie je uitsluitend je eigen club, teams en plannen.','After signing in, you only see your own club, teams and plans.')}</p>
        <div class="auth-tabs"><button type="button" class="${!reg?'on':''}" onclick="go('login')">${T('Inloggen','Sign in')}</button><button type="button" class="${reg?'on':''}" onclick="go('register')">${T('Registreren','Register')}</button></div>
        <label class="auth-field"><span>${T('E-mailadres','Email address')}</span><input id="email" type="email" inputmode="email" autocomplete="email" required value="${e(email)}" placeholder="naam@club.nl"></label>
        <label class="auth-field"><span>${T('Wachtwoord','Password')}</span><div class="password-field"><input id="pass" type="password" autocomplete="${reg?'new-password':'current-password'}" minlength="8" required><button type="button" onclick="togglePasswordVisibility('pass',this)">${T('Tonen','Show')}</button></div></label>
        ${!reg?`<div class="auth-options"><label><input type="checkbox" id="remember" checked> ${T('Ingelogd blijven','Keep me signed in')}</label><button type="button" onclick="showForgotPassword()">${T('Wachtwoord vergeten?','Forgot password?')}</button></div>`:''}
        <div id="auth-message"></div>
        <button id="auth-submit" class="auth-submit" type="submit">${reg?T('Account maken','Create account'):T('Inloggen','Sign in')} <span>→</span></button>
        <small class="auth-enter-hint">${T('Je kunt ook op Enter drukken.','You can also press Enter.')}</small>
      </form></section>
    </main>`;
    setTimeout(()=>document.getElementById(email?'pass':'email')?.focus(),50);
  };
  window.authGo=async function(reg){
    const email=v('email').toLowerCase(),password=v('pass'),button=document.getElementById('auth-submit');
    if(!email||!password){setMessage(T('Vul je e-mailadres en wachtwoord in.','Enter your email and password.'),'error');return}
    localStorage.setItem('nextmatch-last-email',email);
    if(button){button.disabled=true;button.innerHTML=T('Even controleren…','Checking…')}
    const result=reg?await sb.auth.signUp({email,password,options:{emailRedirectTo:baseUrl()}}):await sb.auth.signInWithPassword({email,password});
    if(result.error){setMessage(errorText(result.error),'error');if(button){button.disabled=false;button.innerHTML=`${reg?T('Account maken','Create account'):T('Inloggen','Sign in')} <span>→</span>`};return}
    if(reg&&!result.data.session){setMessage(T('Controleer je e-mail en bevestig je account.','Check your email and confirm your account.'),'success')}
  };
  window.showForgotPassword=function(){
    const email=document.getElementById('email')?.value||lastEmail();
    A.className='auth-page';
    A.innerHTML=`<main class="auth-shell single"><section class="auth-card-wrap"><form class="auth-card" onsubmit="event.preventDefault();sendPasswordReset()"><div class="auth-mobile-logo show"><span>NM</span><b>NextMatch</b></div><button class="auth-back" type="button" onclick="go('login')">← ${T('Terug naar inloggen','Back to sign in')}</button><span class="auth-eyebrow">${T('Account herstellen','Recover account')}</span><h2>${T('Nieuw wachtwoord aanvragen','Request a new password')}</h2><p>${T('We sturen een veilige resetlink naar je e-mailadres.','We will send a secure reset link to your email address.')}</p><label class="auth-field"><span>${T('E-mailadres','Email address')}</span><input id="reset-email" type="email" autocomplete="email" required value="${e(email)}"></label><div id="auth-message"></div><button id="reset-submit" class="auth-submit" type="submit">${T('Resetmail versturen','Send reset email')} <span>→</span></button></form></section></main>`;
    setTimeout(()=>document.getElementById('reset-email')?.focus(),50);
  };
  window.sendPasswordReset=async function(){
    const email=(document.getElementById('reset-email')?.value||'').trim().toLowerCase();
    if(!email){setMessage(T('Vul eerst je e-mailadres in.','Enter your email address.'),'error');return}
    localStorage.setItem('nextmatch-last-email',email);
    const button=document.getElementById('reset-submit');button.disabled=true;button.textContent=T('Versturen…','Sending…');
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:`${baseUrl()}?reset=1`});
    if(error){setMessage(errorText(error),'error');button.disabled=false;button.innerHTML=`${T('Resetmail versturen','Send reset email')} <span>→</span>`;return}
    setMessage(T('Resetmail verstuurd. Controleer ook je spamfolder.','Reset email sent. Check your spam folder too.'),'success');
    button.textContent=T('Mail verstuurd','Email sent');
  };
  window.passwordRecovery=function(){
    A.className='auth-page';
    A.innerHTML=`<main class="auth-shell single"><section class="auth-card-wrap"><form class="auth-card" onsubmit="event.preventDefault();setNewPassword()"><div class="auth-mobile-logo show"><span>NM</span><b>NextMatch</b></div><span class="auth-eyebrow">${T('Account herstellen','Recover account')}</span><h2>${T('Kies een nieuw wachtwoord','Choose a new password')}</h2><p>${T('Gebruik minimaal acht tekens. Een langere wachtzin is nog veiliger.','Use at least eight characters. A longer passphrase is even safer.')}</p><label class="auth-field"><span>${T('Nieuw wachtwoord','New password')}</span><div class="password-field"><input id="new-pass" type="password" autocomplete="new-password" minlength="8" required><button type="button" onclick="togglePasswordVisibility('new-pass',this)">${T('Tonen','Show')}</button></div></label><label class="auth-field"><span>${T('Herhaal wachtwoord','Repeat password')}</span><div class="password-field"><input id="new-pass-confirm" type="password" autocomplete="new-password" minlength="8" required><button type="button" onclick="togglePasswordVisibility('new-pass-confirm',this)">${T('Tonen','Show')}</button></div></label><div id="auth-message"></div><button id="new-pass-submit" class="auth-submit" type="submit">${T('Wachtwoord opslaan','Save password')} <span>→</span></button></form></section></main>`;
  };
  window.setNewPassword=async function(){
    const first=v('new-pass'),second=v('new-pass-confirm');
    if(first.length<8){setMessage(T('Gebruik minimaal acht tekens.','Use at least eight characters.'),'error');return}
    if(first!==second){setMessage(T('De wachtwoorden zijn niet gelijk.','The passwords do not match.'),'error');return}
    const button=document.getElementById('new-pass-submit');button.disabled=true;button.textContent=T('Opslaan…','Saving…');
    const {error}=await sb.auth.updateUser({password:first});
    if(error){setMessage(errorText(error),'error');button.disabled=false;button.textContent=T('Wachtwoord opslaan','Save password');return}
    history.replaceState({},'',baseUrl());window.NM_PASSWORD_RECOVERY=false;route='desk';location.hash='#/desk';notify?.(T('Wachtwoord gewijzigd.','Password changed.'));render();
  };
})();