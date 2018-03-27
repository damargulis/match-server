const MongoClient = require('mongodb').MongoClient;

const mongoPw = process.env.MONGO_PASSWORD;
const mongoUser = process.env.MONGO_USER;

var passwordHash = require('password-hash');

const uri = 'mongodb://' + mongoUser + ':' + mongoPw + '@nativematch-shard-00-00-fvbif.mongodb.net:27017,nativematch-shard-00-01-fvbif.mongodb.net:27017,nativematch-shard-00-02-fvbif.mongodb.net:27017/test?ssl=true&replicaSet=nativeMatch-shard-0&authSource=admin';

function reset() {
	let database = null;
	let nativeMatch = null;
	MongoClient.connect(uri)
	.then((db) => {
		database = db;
		const oldDb = database.db('nativeMatch');
		console.log('dropping old db');
		return oldDb.dropDatabase();
	}).then(() => {
		console.log('dropped');
		nativeMatch = database.db('nativeMatch');
		const user = nativeMatch.collection('user');
		console.log('inserting test users');

		return user.insertMany([
			{
				username: 'test',
                password: passwordHash.generate('test'),
				firstName: 'Dan',
				age: 23,
				gender: 'Male',
				occupation: 'Software Engineer',
				school: 'Washington University in St. Louis',
				interestsGender: 'Female',
				interestsDistance: 50,
				interestsAgeMin: 20,
				interestsAgeMax: 25,
                location: {
                    type: "Point",
                    coordinates: [
                        -90.295861,
                        38.650768,
                    ],
                },
				attending: [],
				liked: [],
				disliked: [],
                photos: [],
			}, {
				username: 'test1',
                password: passwordHash.generate('test1'),
				firstName: 'Jane',
				age: 23,
				gender: 'Female',
				occupation: 'Designer',
				school: 'St. Louis University',
				interestsGender: 'Male',
				interestsDistance: 50,
				interestsAgeMin: 20,
				interestsAgeMax: 25,
                location: {
                    type: "Point",
                    coordinates: [
                        -90.295861,
                        36.650768,
                    ],
                },
				attending: [],
				liked: [],
				disliked: [],
                photos: [],
			}
		]);
	}).then(() => {
		const event = nativeMatch.collection('event');
		console.log('inserting test events');
		return event.insertMany([
			{
				type: 'Concert',
				name: 'Kanye Concert',
				location: {
                    type: "Point",
                    coordinates: [
                        -90.297881,
                        38.655606,
                    ]
				},
				address: {
					street: '6161 Delmar Blvd',
					city: 'St. Louis',
					state: 'MO',
					zip: '63112',
				},
				startTime: new Date('2018-10-10 20:00:00'),
				endTime: new Date('2018-10-10 23:00:00'),
				attendees: [],
			}, {
				type: 'Bar',
				name: 'Half Price Drinks at Three Kings',
				location: {
                    type: 'Point',
                    coordinates: [
					    -90.302944,
                        38.655918,
                    ]
				},
				address: {
					street: '6307 Delmar Blvd',
					city: 'St. Louis',
					state: 'MO',
					zip: '63130',
				},
				startTime: new Date('2018-10-10 22:00:00'),
				endTime: new Date('2018-10-11 01:00:00'),
				attendees: [],
			}, {
				type: 'Movie',
				name: 'Black Panther',
				location: {
                    type: 'Point',
                    coordinates: [
                        -90.316682,
                        38.634205,
                    ]
				},
				address: {
					street: '6706 Clayton Rd.',
					city: 'St. Louis',
					state: 'MO',
					zip: '63117',
				},
				startTime: new Date('2018-10-11 20:00:00'),
				endTime: new Date('2018-10-11 22:00:00'),
				attendees: [],
            }, {
                type: 'Restaurant',
                name: 'Cheap Dinner at Gamlin Whiskey House',
                location: {
                    type: 'Point',
                    coordinates: [
                        -90.261456,
                        38.644545,
                    ]
                },
                address: {
                    street: '236 N Euclid Ave',
                    city: 'St. Louis',
                    state: 'MO',
                    zip: '63108',
                },
				startTime: new Date('2018-10-09 17:00:00'),
				endTime: new Date('2018-10-09 22:00:00'),
				attendees: [],
            }, {
                type: 'Play',
                name: 'Hamilton at Peabody Opera House',
                location: {
                    type: 'Point',
                    coordinates: [
                        -90.201804,
                        38.627865,
                    ]
                },
                address: {
                },
				startTime: new Date('2018-10-12 19:00:00'),
				endTime: new Date('2018-10-12 22:00:00'),
				attendees: [],
            }, {
                type: 'Sports',
                name: 'Blues vs. Blackhawks',
                location: {
                    type: 'Point',
                    coordinates: [
                        -90.202684,
                        38.626842,
                    ]
                },
                address: {
                    street: '1401 Clark Ave',
                    city: 'St. Louis',
                    state: 'MO',
                    zip: '63103',
                },
				startTime: new Date('2018-10-12 18:00:00'),
				endTime: new Date('2018-10-12 22:00:00'),
				attendees: [],
            }, {
                type: 'Museum',
                name: 'St. Louis Art Museum Exhibt',
                location: {
                    type: 'Point',
                    coordinates: [
                        -90.294953,
                        38.639095,
                    ]
                },
                address: {
                    street: '1 Fine Arts Dr',
                    city: 'St. Louis',
                    state: 'MO',
                    zip: '63110',
                },
				startTime: new Date('2018-10-12 08:00:00'),
				endTime: new Date('2018-10-12 20:00:00'),
				attendees: [],
            }, {
                type: 'Bar',
                name: 'Trivia at Tiff\'s',
                location: {
                    type: 'Point',
                    coordinates: [
                        -74.329924,
                        40.859700,
                    ]
                },
                address: {
                    street: '73 Bloomfield Ave',
                    city: 'Montville',
                    state: 'NJ',
                    zip: '07058',
                },
                startTime: new Date('2018-10-15 19:00:00'),
                endTime: new Date('2018-10-15 21:00:00'),
                attendees: [],
            }
        ]);
	}).then(() => {
        console.log('adding event location index');
        let user = nativeMatch.collection('user');
        return user.ensureIndex({ location: "2dsphere" })
    }).then(() => {
        console.log('adding event location index')
        let event = nativeMatch.collection('event');
        return event.ensureIndex({ location: "2dsphere" })
    }).then(() => {
		console.log('finished');
		database.close();
	}).catch((err) => {
		console.log(err);
	});
}

reset();	
