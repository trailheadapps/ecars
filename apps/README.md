# eCars Heroku Apps & Services

Here you can find all the supporting applications and services deployed to Heroku for eCars

## Deploy monorepo apps to Heroku

1.  Create application using `heroku-buildpack-monorepo`:

```
heroku create <app> --buildpack https://github.com/lstoll/heroku-buildpack-monorepo.git
```

2.  Add Node.js or the respective buildpack:

```
heroku buildpacks:add -a <app> heroku/nodejs
```

3. Set `APP_BASE` environment variable, This is the relative path from the root of the repository to the root of the app.

```
heroku config:set APP_BASE=apps/ecars-app
```

4. For each application you'll need to push it to Heroku using the following command:

```
git push git@heroku.com:<app>.git master
```
