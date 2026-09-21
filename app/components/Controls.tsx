'use client';
import {useState} from 'react';
export default function Controls(){const [msg,setMsg]=useState('');async function refresh(){setMsg('Refreshing live data…');location.reload()}return <><div className="actions"><a className="btn gold" href="/api/auth/yahoo/login">Connect Yahoo</a><button className="btn primary" onClick={refresh}>Refresh Live Yahoo</button></div>{msg&&<div className="tiny muted" style={{marginTop:6}}>{msg}</div>}</>}
