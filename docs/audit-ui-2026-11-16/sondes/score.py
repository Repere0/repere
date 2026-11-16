import json,re,os,collections
S=os.environ['S']; b=json.load(open(S+'/captures/mesures.json'))
SANS_TITRE={'scrutins','qag','recherche','confort-lecture','quiz'}
CONCURRENCE={'finances','argent','accueil','chez-vous','presidentielle-2027'}
ETAT={'qui-decide':'X','finances':'X','vote':'X','a-venir':'X','argent':'X','accueil':'X','chez-vous':'X','elu':'!','scrutins':'!','qag':'!','presidentielle-2027':'!','dictionnaire':'!','elus':'V','groupe':'V','annuaire-fiche':'V','pour-vous':'V','actus':'!','repere-du-jour':'!','recherche':'V','sources':'V','quiz':'V'}
SANS_RETOUR={'repere-du-jour','quiz','a-propos','confidentialite'}
RETOUR_FIGE={'elu','dictionnaire','procedure','scrutins','qag','partager','vote','argent','sources','actus','annuaire-fiche'}
FOCUS_KO={'recherche'}; FB_KO={'vote','scrutins','qag','dictionnaire'}; ALIGN={'qui-decide','elus','recherche','annuaire-fiche'}
sym={'V':'✅','!':'⚠️','X':'❌','-':'—'}
rows=[]
for n,m in b.items():
  x=m['clair']; c=[]
  c.append('X' if n in SANS_TITRE else '!' if n in CONCURRENCE else 'V')
  r=x['horsGrille']/max(1,x['espacesTotal']); c.append('V' if r<=.05 else '!' if r<=.15 else 'X')
  lh=[l for l in x['lhFaible'] if not re.search('[-]',l) and not re.search(r'« \d+ »',l)]
  c.append('X' if x['petit'] else '!' if lh else 'V')
  c.append('X' if x['contraste'] or m['sombre']['contraste'] else 'V')
  c.append('X' if x['cible'] else '!' if x['proches'] and n not in('finances','argent','scrutins','qag','presidentielle-2027') else 'V')
  c.append(ETAT.get(n,'-'))
  c.append('X' if n in FOCUS_KO else '!' if n in FB_KO else 'V')
  c.append('X' if n in SANS_RETOUR else '!' if n in RETOUR_FIGE else 'V')
  dens=(1 if x['pave'] else 0)+(1 if x['premierEcran']['mots']>150 or x['nInteractifs1']>20 else 0)
  c.append('X' if dens==2 else '!' if dens else 'V')
  c.append('!' if n in ALIGN else 'V')
  ser=[a for a in (x.get('axe') or []) if a['impact'] in('critical','serious')]
  c.append('X' if ser else '!')
  c.append('X' if x['cls']>0.1 else '!' if n in ('scrutins','qag','presidentielle-2027','dictionnaire') else 'V')
  app=[v for v in c if v!='-']; ok=sum(v=='V' for v in app); ko=[i+1 for i,v in enumerate(c) if v=='X']
  pr='P0' if 'X' in (c[5],c[7],c[11]) or (c[10]=='X' and any(a['impact']=='critical' for a in ser)) else 'P1' if ko or sum(v=='!' for v in c)>=4 else 'P2'
  rows.append((n,c,ok,len(app),ko,pr,round(r*100),x['cls']))
print('| Écran | '+' | '.join(f'C{i}' for i in range(1,13))+' | Non conformes | Score | Priorité |')
print('|'+'---|'*16)
for n,c,ok,a,ko,pr,r,cls in rows: print(f'| `{n}` | '+' | '.join(sym[v] for v in c)+f" | {', '.join(f'C{k}' for k in ko) or '—'} | {ok}/{a} | {pr} |")
print(); print(collections.Counter(r[5] for r in rows)); print([(n,r) for n,c,ok,a,ko,pr,r,cls in rows])
