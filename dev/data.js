var passwordHash = require('password-hash');

const users = [{
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
        type: 'Point',
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
        type: 'Point',
        coordinates: [
            -90.295861,
            36.650768,
        ],
    },
    attending: [],
    liked: [],
    disliked: [],
    photos: [],
}];

const today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
const tomorrow = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);
const dayAfter = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

const events = [
    {
        type: 'Concert',
        name: 'Kanye Concert',
        location: {
            type: 'Point',
            coordinates: [
                -90.297881,
                38.655606,
            ],
        },
        address: {
            street: '6161 Delmar Blvd',
            city: 'St. Louis',
            state: 'MO',
            zip: '63112',
        },
        startTime: new Date((new Date(dayAfter)).setHours(20)),
        endTime: new Date((new Date(dayAfter)).setHours(23)),
        attendees: [],
    }, {
        type: 'Bar',
        name: 'Half Price Drinks at Three Kings',
        location: {
            type: 'Point',
            coordinates: [
                -90.302944,
                38.655918,
            ],
        },
        address: {
            street: '6307 Delmar Blvd',
            city: 'St. Louis',
            state: 'MO',
            zip: '63130',
        },
        startTime: new Date((new Date(today)).setHours(21)),
        endTime: new Date((new Date(today)).setHours(23)),
        attendees: [],
    }, {
        type: 'Movie',
        name: 'Special Local Showing of The Room',
        location: {
            type: 'Point',
            coordinates: [
                -90.316682,
                38.634205,
            ],
        },
        address: {
            street: '6706 Clayton Rd.',
            city: 'St. Louis',
            state: 'MO',
            zip: '63117',
        },
        startTime: new Date((new Date(tomorrow)).setHours(18)),
        endTime: new Date((new Date(tomorrow)).setHours(20)),
        attendees: [],
    }, {
        type: 'Restaurant',
        name: 'Cheap Dinner at Gamlin Whiskey House',
        location: {
            type: 'Point',
            coordinates: [
                -90.261456,
                38.644545,
            ],
        },
        address: {
            street: '236 N Euclid Ave',
            city: 'St. Louis',
            state: 'MO',
            zip: '63108',
        },
        startTime: new Date((new Date(dayAfter)).setHours(17)),
        endTime: new Date((new Date(dayAfter)).setHours(22)),
        attendees: [],
    }, {
        type: 'Play',
        name: 'Hamilton at Peabody Opera House',
        location: {
            type: 'Point',
            coordinates: [
                -90.201804,
                38.627865,
            ],
        },
        address: {
        },
        startTime: new Date((new Date(today)).setHours(14)),
        endTime: new Date((new Date(today)).setHours(18)),
        attendees: [],
    }, {
        type: 'Sports',
        name: 'Blues vs. Blackhawks',
        location: {
            type: 'Point',
            coordinates: [
                -90.202684,
                38.626842,
            ],
        },
        address: {
            street: '1401 Clark Ave',
            city: 'St. Louis',
            state: 'MO',
            zip: '63103',
        },
        startTime: new Date((new Date(tomorrow)).setHours(18)),
        endTime: new Date((new Date(tomorrow)).setHours(22)),
        attendees: [],
    }, {
        type: 'Museum',
        name: 'St. Louis Art Museum Exhibt',
        location: {
            type: 'Point',
            coordinates: [
                -90.294953,
                38.639095,
            ],
        },
        address: {
            street: '1 Fine Arts Dr',
            city: 'St. Louis',
            state: 'MO',
            zip: '63110',
        },
        startTime: new Date((new Date(dayAfter)).setHours(8)),
        endTime: new Date((new Date(dayAfter)).setHours(18)),
        attendees: [],
    }, {
        type: 'Bar',
        name: 'Trivia at Tiff\'s',
        location: {
            type: 'Point',
            coordinates: [
                -74.329924,
                40.859700,
            ],
        },
        address: {
            street: '73 Bloomfield Ave',
            city: 'Montville',
            state: 'NJ',
            zip: '07058',
        },
        startTime: new Date((new Date(today)).setHours(21)),
        endTime: new Date((new Date(today)).setHours(23)),
        attendees: [],
    },
];

const photos = [{
    photo: 'stickman.png',
    username: 'test',
}, {
    photo: 'stickman2.png',
    username: 'test',
}, {
    photo: 'stickman3.png',
    username: 'test',
}, {
    photo: 'stickwoman.jpg',
    username: 'test1',
}, {
    photo: 'stickwoman2.png',
    username: 'test1',
}, {
    photo: 'stickwoman3.jpg',
    username: 'test1',
}];

module.exports = {
    users,
    events,
    photos,
};
