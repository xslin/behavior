local redis = require "linxsh.redis.redis"
local redis_client = {}

function redis_client.getRedis()
	local red = redis:new()
	if context.config.redis.password~= nil then
		local ok, err = red:auth(context.config.redis.password)
		if not ok then
			return nil
		end
	end
	return red
end

return redis_client