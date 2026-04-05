# cybersecurity-repo-auditor
Valida ciertos criterios en los repositorios de una organización

# Usar y configurar variables de entorno
Copiar el archivo `/config/.env.example` y renombrar por `/config/.env.toyota`, y rellenar las variables de entorno segun el caso.

Ahora en el archivo `package.json` dentro de `scripts`, crear un nuevo item llamado `"toyota": "npm run start -- toyota"`, con eso usará las variables de entorno de `/config/.env.toyota`
usar: `npm run toyota`

Nota: `Por defecto, cualquier .env.xxxx creado, está siendo ignorado por git.`


## Usar en con pipeline Github
````
- name: Instalar Node
  uses: actions/setup-node@v4
  with:
  node-version: 20
````

## Crear Token Github (Token Classic)
Solo necesitamos acceso para listar los repositorios de la organización para no incumplir el minimo privilegio, nos dirigimos a este URL 
`https://github.com/settings/tokens`
![](https://imgur.com/1gvUHve.png)
 y luego le damos check solo a `repo`, `admin:org => read:org`
![](https://imgur.com/BdQaN13.png)
Al finalizar solo copiamos el token generado
![](https://imgur.com/w8aiorA.png)
No olvidar colocar ese token access en el `.env.{nombre}` en `GITHUB_ACCESS_TOKEN`

## Crear Token Github (Fine-grained)
En el caso de que la orgnaización tenga bloqueado el acceso mediante TokenClassic, debemos usar este nuevo método, entramos al link `https://github.com/settings/personal-access-tokens` 
y creamos un nuevo token y configuramos así.

![](https://imgur.com/qVw62Ab.png)
y referente a permisos, selecionamos 
![](https://imgur.com/mDQCYwz.png)
y creamos el token, este luce distinto, pero igualmente es compatible, colocar dentro de `.env.{nombre}` en `GITHUB_ACCESS_TOKEN`.



