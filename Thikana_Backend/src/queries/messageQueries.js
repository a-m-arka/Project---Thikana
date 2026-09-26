const messageQueries = {
  createMessage: `
        INSERT INTO Messages (sender_id, receiver_id, post_id, message_text)
        VALUES (?, ?, ?, ?);
    `,
  getMessageById: `
        SELECT m.*, sender.name AS sender_name, receiver.name AS receiver_name,
            reference_property.property_id AS referenced_property_id,
            reference_property.title AS referenced_property_title,
            reference_property.city AS referenced_property_city,
            reference_property.price AS referenced_property_price,
            (
              SELECT reference_image.image_url
              FROM Property_Images reference_image
              WHERE reference_image.property_id = reference_property.property_id
              ORDER BY reference_image.image_id ASC
              LIMIT 1
            ) AS referenced_property_image
        FROM Messages m
        JOIN Users sender ON sender.user_id = m.sender_id
        JOIN Users receiver ON receiver.user_id = m.receiver_id
        LEFT JOIN Posts reference_post ON reference_post.post_id = m.post_id
        LEFT JOIN Properties reference_property
          ON reference_property.property_id = reference_post.property_id
        WHERE m.message_id = ?;
    `,
  getLatestConversation: `
        SELECT m.*, sender.name AS sender_name, receiver.name AS receiver_name,
            reference_property.property_id AS referenced_property_id,
            reference_property.title AS referenced_property_title,
            reference_property.city AS referenced_property_city,
            reference_property.price AS referenced_property_price,
            (
              SELECT reference_image.image_url
              FROM Property_Images reference_image
              WHERE reference_image.property_id = reference_property.property_id
              ORDER BY reference_image.image_id ASC
              LIMIT 1
            ) AS referenced_property_image
        FROM Messages m
        JOIN Users sender ON sender.user_id = m.sender_id
        JOIN Users receiver ON receiver.user_id = m.receiver_id
        LEFT JOIN Posts reference_post ON reference_post.post_id = m.post_id
        LEFT JOIN Properties reference_property
          ON reference_property.property_id = reference_post.property_id
        WHERE ((m.sender_id = ? AND m.receiver_id = ?)
            OR (m.sender_id = ? AND m.receiver_id = ?))
        ORDER BY m.message_id DESC
        LIMIT ?;
    `,
  getConversationBefore: `
        SELECT m.*, sender.name AS sender_name, receiver.name AS receiver_name,
            reference_property.property_id AS referenced_property_id,
            reference_property.title AS referenced_property_title,
            reference_property.city AS referenced_property_city,
            reference_property.price AS referenced_property_price,
            (
              SELECT reference_image.image_url
              FROM Property_Images reference_image
              WHERE reference_image.property_id = reference_property.property_id
              ORDER BY reference_image.image_id ASC
              LIMIT 1
            ) AS referenced_property_image
        FROM Messages m
        JOIN Users sender ON sender.user_id = m.sender_id
        JOIN Users receiver ON receiver.user_id = m.receiver_id
        LEFT JOIN Posts reference_post ON reference_post.post_id = m.post_id
        LEFT JOIN Properties reference_property
          ON reference_property.property_id = reference_post.property_id
        WHERE ((m.sender_id = ? AND m.receiver_id = ?)
            OR (m.sender_id = ? AND m.receiver_id = ?))
          AND m.message_id < ?
        ORDER BY m.message_id DESC
        LIMIT ?;
    `,
  getConversations: `
        SELECT m.*, other_user.user_id AS other_user_id,
            other_user.name AS other_user_name,
            other_user.profile_picture_url AS other_user_profile_picture_url,
            (
              SELECT COUNT(*)
              FROM Messages unread_message
              WHERE unread_message.sender_id = other_user.user_id
                AND unread_message.receiver_id = ?
                AND unread_message.read_status <> 'read'
              ) AS unread_count
        FROM Messages m
        JOIN Users other_user ON other_user.user_id =
            CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
        WHERE (m.sender_id = ? OR m.receiver_id = ?)
          AND m.message_id = (
              SELECT MAX(m2.message_id)
              FROM Messages m2
              WHERE (m2.sender_id = ? AND m2.receiver_id = other_user.user_id)
                 OR (m2.sender_id = other_user.user_id AND m2.receiver_id = ?)
          )
        ORDER BY m.sent_at DESC, m.message_id DESC;
    `,
  markConversationRead: `
        UPDATE Messages
        SET read_status = 'read'
        WHERE sender_id = ? AND receiver_id = ? AND read_status <> 'read';
    `,
  markMessageDelivered: `
        UPDATE Messages
        SET read_status = 'delivered'
        WHERE message_id = ? AND read_status = 'unread';
    `,
};

export default messageQueries;
