var passwordHash = require('password-hash');

function createUser(firstName, gender, occupation, school) {
    //password is username is firstName
    return {
        username: firstName,
        password: passwordHash.generate(firstName),
        firstName: firstName,
        gender: gender ? 'Male' : 'Female',
        age: 24,
        occupation: occupation,
        school: school,
        interestsGender: gender ? 'Female' : 'Male',
        interestsAgeMin: 20,
        interestsAgeMax: 25,
        interestsDistance: 50,
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
    };
}

function createUsers(){
    return [{
        name: 'Jim',
        male: true,
        occupation: 'Salesman',
        school: 'Scranton University',
    }, {
        name: 'Pam',
        male: false,
        occupation: 'Secratery',
        school: 'Marywood University',
    }, {
        name: 'Troy',
        male: true,
        occupation: 'Sailor',
        school: 'Greendale University',
    }, {
        name: 'Annie',
        male: false,
        occupation: 'Forensic Analyist',
        school: 'Greendale University',
    }, {
        name: 'Leslie',
        male: false,
        occupation: 'Director of the National Parks Service',
        school: 'Pawnee Community College',
    }, {
        name: 'Ben',
        male: true,
        occupation: 'Congressman',
        school: 'Indiana University',
    }].map((user) => createUser(
        user.name,
        user.male,
        user.occupation,
        user.school
    ));
}

const users = createUsers();

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
    username: 'Jim',
    photo: 'Jim1.jpg',
}, {
    username: 'Jim',
    photo: 'Jim2.jpg',
}, {
    username: 'Pam',
    photo: 'Pam1.jpg',
}, {
    username: 'Pam',
    photo: 'Pam2.jpg',
}, {
    username: 'Pam',
    photo: 'Pam3.jpg',
}, {
    username: 'Troy',
    photo: 'Troy1.jpg',
}, {
    username: 'Troy',
    photo: 'Troy2.jpg',
}, {
    username: 'Annie',
    photo: 'Annie1.jpg',
}, {
    username: 'Annie',
    photo: 'Annie2.jpg',
}, {
    username: 'Annie',
    photo: 'Annie3.jpg',
}, {
    username: 'Leslie',
    photo: 'Leslie1.png',
}, {
    username: 'Leslie',
    photo: 'Leslie2.jpg',
}, {
    username: 'Ben',
    photo: 'Ben1.jpg',
}, {
    username: 'Ben',
    photo: 'Ben2.png',
}];

module.exports = {
    users,
    events,
    photos,
};
