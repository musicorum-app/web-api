# Musicorum web api

### Routers:
<pre>
GET     /auth/me
POST    /auth/twitter
GET     /auth/twitter/callback
POST    /auth/lastfm/callback
DELETE  /auth/schedulers/:id
GET     /auth/schedulers
PUT     /auth/schedulers
</pre>

### TODO Routers:

<pre>
PATCH   /auth/schedulers/:id
GET     /auth/schedulers/:id/runs
DELETE  /auth/schedulers/:id/runs/:id
</pre>
