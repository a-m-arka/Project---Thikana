const propertyQueries = {
  addNewProperty: `
        INSERT INTO Properties (
            user_id, title, address, city, price, type, description
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `,

  deleteProperty: `
        DELETE FROM Properties 
        WHERE property_id = ?;
    `,

  updateProperty: `
        UPDATE Properties 
        SET 
            title = COALESCE(?, title),
            address = COALESCE(?, address),
            city = COALESCE(?, city),
            price = COALESCE(?, price),
            type = COALESCE(?, type),
            description = COALESCE(?, description)
        WHERE property_id = ?;
    `,

  addPropertyImage: `
        INSERT INTO Property_Images (property_id, image_url, cloudinary_public_id)
        VALUES (?, ?, ?);
    `,

  deletePropertyImage: `
        DELETE FROM Property_Images
        WHERE cloudinary_public_id = ?;
    `,

  getPropertyImageIds: `
        SELECT cloudinary_public_id 
        FROM Property_Images 
        WHERE property_id = ?;
    `,

  getAllPropertiesOfUser: `
        SELECT 
            p.property_id, 
            p.user_id, 
            p.title, 
            p.address, 
            p.city, 
            p.price, 
            p.type, 
            p.description, 
            MAX(post.post_id) AS post_id,
            MAX(post.post_type) AS post_type,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'url', pi.image_url,
                    'publicId', pi.cloudinary_public_id
                )
            ) AS images
        FROM Properties p
        LEFT JOIN Property_Images pi ON p.property_id = pi.property_id
        LEFT JOIN Posts post ON post.property_id = p.property_id
        WHERE p.user_id = ?
        GROUP BY p.property_id;
    `,

  getAllProperties: `
        SELECT
            p.property_id,
            p.user_id,
            u.name AS owner_name,
            p.title,
            p.address,
            p.city,
            p.price,
            p.type,
            p.description,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'url', pi.image_url,
                    'publicId', pi.cloudinary_public_id
                )
            ) AS images
        FROM Properties p
        JOIN Users u ON u.user_id = p.user_id
        LEFT JOIN Property_Images pi ON p.property_id = pi.property_id
        GROUP BY p.property_id
        ORDER BY p.property_id DESC;
    `,

  getPropertyById: `
        SELECT
            p.property_id,
            p.user_id,
            u.name AS owner_name,
            p.title,
            p.address,
            p.city,
            p.price,
            p.type,
            p.description,
            MAX(post.post_id) AS post_id,
            MAX(post.post_type) AS post_type,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'url', pi.image_url,
                    'publicId', pi.cloudinary_public_id
                )
            ) AS images
        FROM Properties p
        JOIN Users u ON u.user_id = p.user_id
        LEFT JOIN Posts post ON post.property_id = p.property_id
        LEFT JOIN Property_Images pi ON pi.property_id = p.property_id
        WHERE p.property_id = ?
        GROUP BY p.property_id;
    `,

  checkUserPropertyOwnership: `
        SELECT COUNT(*) AS count 
        FROM Properties 
        WHERE property_id = ? AND user_id = ?;
    `,

  checkPropertyImageOwnership: `
        SELECT COUNT(*) AS imageCount
        FROM Property_Images
        WHERE property_id = ? AND cloudinary_public_id = ?;
    `,

    getOwnedPropertyImage: `
                SELECT pi.image_id, pi.property_id, pi.cloudinary_public_id
                FROM Property_Images pi
                INNER JOIN Properties p ON p.property_id = pi.property_id
                WHERE pi.cloudinary_public_id = ? AND p.user_id = ?;
        `,

  countPropertyImages: `
        SELECT COUNT(*) AS image_count
        FROM Property_Images
        WHERE property_id = ?;
    `,
};

export default propertyQueries;
