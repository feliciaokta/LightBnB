const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  email: '1@2.com',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

// const email1 = process.argv[2];
// const id = process.argv[2];
// const username1 = process.argv[2];
// const email2 = process.argv[3];
// const password1 = process.argv[4];

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

 const getUserWithEmail = (email) => {
  return pool
    .query(
      `SELECT * FROM users WHERE email LIKE $1;`,
      [`%${email}%`])
      .then((result) => {
        console.log(result.rows);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };



// const getUserWithEmail = function(email) {
//   let user;
//   for (const userId in users) {
//     user = users[userId];
//     if (user.email.toLowerCase() === email.toLowerCase()) {
//       break;
//     } else {
//       user = null;
//     }
//   }
//   return Promise.resolve(user);
// }
exports.getUserWithEmail = getUserWithEmail;



/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

 const getUserWithId = (id) => {
  return pool
    .query(
      `SELECT * FROM users WHERE id LIKE $1;`,
      [`%${id}`])
      .then((result) => {
        console.log(result.rows);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

// const getUserWithId = function(id) {
//   return Promise.resolve(users[id]);
// }
exports.getUserWithId = getUserWithId;



/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

 const addUser = (user) => {
   console.log("user: ", user);
  return pool
    .query(
      `INSERT INTO users(name, email, password) VALUES ($1, $2, $3)
      RETURNING *`,
      [user.name, user.email, user.password])
      .then((result) => {
        console.log(result.rows);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };


// const addUser =  function(user) {
//   const userId = Object.keys(users).length + 1;
//   user.id = userId;
//   users[userId] = user;
//   return Promise.resolve(user);
// }
exports.addUser = addUser;



/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */

 const getAllReservations = (guest_id, limit = 10) => {
  return pool
    .query(`SELECT reservations.$1 FROM reservations LIMIT $2;`, [guest_id, limit])
    .then((result) => {
      console.log(result.rows);
    })
    .catch((err) => {
      console.log(err.message);
    });
};


// const getAllReservations = function(guest_id, limit = 10) {
//   return getAllProperties(null, 2);
// }
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

//  const getAllProperties = (options, limit = 10) => {
//   return pool
//     .query(`SELECT $1 FROM properties LIMIT $2;`,
//     [options, limit])
//     .then((result) => {
//       console.log(result.rows);
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// };



const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(`%${options.owner_id}%`);
    queryString += `WHERE properties.owner_id LIKE $${queryParams.length}`;
  }

  if (options.minimum_price_per_night, options.maximum_price_per_night) {
    queryParams.push(`%${options.minimum_price_per_night}%, %${options.maximum_price_per_night}%`);
    queryString += `WHERE properties.cost_per_night > ($${options.minimum_price_per_night} /100) AND properties.cost_per_night < ($${options.maximum_price_per_night} /100)`;
  }

  if (options.minimum_rating) {
    queryParams.push(`%${options.minimum_rating}%`);
    queryString += `WHERE property_reviews.rating >= $${options.minimum_rating}`;
  }

  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};


// const getAllProperties = function(options, limit = 10) {
//   const limitedProperties = {};
//   for (let i = 1; i <= limit; i++) {
//     limitedProperties[i] = properties[i];
//   }
//   return Promise.resolve(limitedProperties);
// }
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */

 const addProperty = (property) => {
  return pool
    .query(
      `INSERT INTO properties VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;`,
      [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms])
      .then((result) => {
        console.log(result.rows);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

// const addProperty = function(property) {
//   const propertyId = Object.keys(properties).length + 1;
//   property.id = propertyId;
//   properties[propertyId] = property;
//   return Promise.resolve(property);
// }

exports.addProperty = addProperty;
