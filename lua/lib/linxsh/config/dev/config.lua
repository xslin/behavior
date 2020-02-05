local Config = {}

--[[
Mysql配置
--]]
Config.mysql = {}
Config.mysql.host = "10.10.0.204"
Config.mysql.port = 3306
Config.mysql.database = "analysis"
Config.mysql.user = "analysis"
Config.mysql.password = "analysis"

--[[
shared dict配置
--]]
Config.shared = {}
Config.shared.timeout = 60

--[[
定时服务配置
--]]
Config.timer = {}
Config.timer.delay = Config.shared.timeout  - 30

--[[
定义kafka配置
--]]
Config.kafka = {}
Config.kafka.broker_list = {
{ host = "10.10.7.13", port = 9092 },
{ host = "10.10.7.12", port = 9092 },
{ host = "10.10.0.70", port = 9092 },
}
Config.kafka.topic = {}
Config.kafka.topic.action = "foresee-analysis-action-source"--事件源数据主题配置
Config.kafka.topic.install = "foresee-analysis-install-source"--安装源数据主题配置

--[[
转发配置
--]]
Config.redirect = {}

--[[
redis配置
--]]
Config.redis = {}
Config.redis.host = '10.10.0.76'
Config.redis.port = 6379
Config.redis.timeout = 1000
Config.redis.poolSize = 100
Config.redis.maxIdle = 60000

--[[
状态配置编码
--]]
Config.result = {}
Config.result.SUCC = {code="000",msg="成功"}
Config.result.SIGN = {code="100001",msg="sign is illegal"}
Config.result.HOST = {code="110001",msg="request origin is illegal"}
Config.result.PARAM = {code="120001",msg="request param is illegal"}
Config.result.SK = {code="130001",msg="sk is illegal"}
Config.result.REDIS = {code="140001",msg="redis failed to auth"}
Config.result.REUSED = {code="140002",msg="failed to get reused times"}

return Config