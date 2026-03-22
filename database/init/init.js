// MongoDB 初始化脚本
db.createUser({
  user: "admin",
  pwd: "password123",
  roles: [
    {
      role: "readWrite",
      db: "ideal_market"
    }
  ]
});

// 创建索引
db.ideas.createIndex({ "userId": 1, "createdAt": -1 });
db.ideas.createIndex({ "status": 1, "createdAt": 1 });
db.ideas.createIndex({ "isListedOnMarket": 1, "createdAt": -1 });
db.ideas.createIndex({ "aiScore": -1 });

db.users.createIndex({ "openid": 1 });
db.users.createIndex({ "role": 1, "createdAt": -1 });