local redis = require "linxsh.redis.redis_client"
local encrypt = require "linxsh.encrypt.encrypt"
local log = require "linxsh.logs.log"
local uri_handler = require "linxsh.handler.uri_handler"


--redis缓存数据key前缀
local REDIS_KEY_PREFIX = "analysis-ai-"

--[[
请求重定向
--]]
local function redirect(sc,flag)
	if flag.code == context.config.result.SUCC.code then
		ngx.exec("@behavior.internal")
	else
		log.err(sc,flag)
		ngx.exit(ngx.HTTP_FORBIDDEN)
	end
end

--[[
解析用户请求
--]]
local function parseUri()
	return uri_handler.parseUri()
end

--[[
获取redis链接
--]]
local function getRed(args)
	local red = redis.getRedis()
	if red == nil then
		redirect(args.sc,context.config.result.REDIS)
	end
	return red
end

--[[
校验签名
--]]
local function checkSign(args,si)
	if encrypt.checkSign(args,si) then
		--一致则进入下一步操作，记录日志，"@behavior.internal"为内部调用location
		redirect(args.sc,context.config.result.SUCC)
	else
		--不一致，拒绝用户的访问
		redirect(args.sc,context.config.result.SIGN)
	end
end

--[[
根据sk从redis中获取值，防止伪造sk
--]]
local function checkSecretKey(args,si)
	local red = getRed(args)
	local k = REDIS_KEY_PREFIX..args.sk
	--从redis中获取值
	local r,e = red:get(k)
	if r == nil then
		--如果sk存在则先清理redis缓存，避免重复请求，然后执行成功的回调
		red:set(k, args.sk)
		red:expire(k, 30)
		--校验签名
		checkSign(args,si)
	else
		--如果值为空则代表sk是伪造的
		redirect(args.sc,context.config.result.SK)
	end
end

--[[
处理用户行为数据
--]]
local function handle()
	--获取请求参数
	local params = parseUri()
	local si = params.si
	--判断关键字si、sk、sc是否为空，如果为空则终止本次的http请求
	if si == nil or params.sk == nil or params.sc == nil then
		redirect(params.sc,context.config.result.PARAM)
	end
	--验证加密传
	checkSecretKey(params,si)
end

------------------------------------处理请求（开始）------------------------------------
handle()
------------------------------------处理请求（结束）------------------------------------