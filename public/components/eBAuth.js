export function createAuth(container,{signIn,signOut,user,onSignedIn,onSignedOut}){
  container.className="eb-auth";
  container.innerHTML='<small id="supabase-auth-status">Supabase: checking session…</small><form class="eb-auth-login"><input name="email" type="email" autocomplete="email" placeholder="eBliss email" required><input name="password" type="password" autocomplete="current-password" placeholder="Password" required><button type="submit">Sign in</button></form><div class="eb-auth-account" hidden><strong class="eb-auth-user"></strong><button class="secondary wide" type="button">Sign out</button></div>';
  const status=container.querySelector("#supabase-auth-status"),form=container.querySelector("form"),account=container.querySelector(".eb-auth-account"),label=container.querySelector(".eb-auth-user"),out=account.querySelector("button");
  function render(current){const signedIn=Boolean(current);form.hidden=signedIn;account.hidden=!signedIn;label.textContent=current?.email||"";status.textContent=signedIn?`Supabase: ${current.email} signed in`:"Supabase: sign in to sync"}
  form.addEventListener("submit",async event=>{event.preventDefault();const button=form.querySelector("button"),data=new FormData(form);button.disabled=true;status.textContent="Signing in…";try{const current=await signIn(String(data.get("email")).trim(),String(data.get("password")));form.reset();render(current);await onSignedIn?.(current)}catch(error){status.textContent=error.message}finally{button.disabled=false}});
  out.addEventListener("click",async()=>{out.disabled=true;try{await signOut();render(null);await onSignedOut?.()}catch(error){status.textContent=error.message}finally{out.disabled=false}});
  void user().then(render).catch(()=>render(null));
  return {setStatus(message){status.textContent=message},render};
}
