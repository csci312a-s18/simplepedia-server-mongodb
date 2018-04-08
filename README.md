# Simplepedia MongoDB Server

This is a MongoDB-backed Simplepedia server implementation designed for
stand-alone use or deployment to Heroku.

## Development

### Prepare the database

Run `npm install` to install the dependencies and create a `./data` directory (as a "postinstall" script) for use by MongoDB.

The repository includes some sample data to seed the database. To seed the database, first start the database in one shell with `npm run mongo` (which is equivalent to `mongod --config mongod.conf`) and then in a second terminal import the seed data with

```
mongoimport --host localhost:5000 --db simplepedia --collection articles --jsonArray seed.json
```

### Testing

The test suite can be launched with `npm test`.

### Linting with eslint

The server is configured with the aggressive AirBnB eslint rules. These rules
were installed with:

```
npx install-peerdeps --dev eslint-config-airbnb-base
```

and `.eslintrc.json` configured with:

```
{
  "extends": "airbnb-base",
	"env": {
		"jest": true
	}
}
```

The linter can be run with `npm run lint` or `npx eslint .`.
