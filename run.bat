@echo off
rem ??Windows??nginx??????????????????
echo ==================begin========================
cls
color 0a 
TITLE web foresee Nginx ???????
CLS
echo. 
echo. ** foresee Nginx ???????  ***
echo.
::*************************************************************************************************************
::ngxin ????????
set NGINX_PATH=E:
::nginx ??????
set NGINX_DIR=E:\SVN\emall\source\behavior\
::*************************************************************************************************************
:MENU 
echo. ***** nginx ????list ******
echo. ??????????¡¤??:%NGINX_DIR%
::tasklist|findstr /i "nginx.exe"
tasklist /fi "imagename eq nginx.exe"
echo.
    if ERRORLEVEL 1 (
        echo nginx.exe??????
    ) else (
        echo nginx.exe????
    )
echo. 
::*************************************************************************************************************
echo. 
	echo.  [1] ???Nginx
	echo.  [2] ???Nginx
	echo.  [3] ????Nginx
	echo.  [4] ???????
	echo.  [5] ???????Nginx???????
	echo.  [6] ??????nginx???????
	echo.  [7] ??nginx version
	echo.  [0] ?? ??
echo. 
echo.?????????????:
set /p ID=
	IF "%id%"=="1" GOTO start 
	IF "%id%"=="2" GOTO stop 
	IF "%id%"=="3" GOTO restart 
	IF "%id%"=="4" GOTO MENU
	IF "%id%"=="5" GOTO reloadConf 
	IF "%id%"=="6" GOTO checkConf 
	IF "%id%"=="7" GOTO showVersion 
	IF "%id%"=="0" EXIT
PAUSE
::*************************************************************************************************************
::???
:start 
	call :startNginx
	GOTO MENU
::??
:stop 
	call :shutdownNginx
	GOTO MENU
::????
:restart 
	call :shutdownNginx
	call :startNginx
	GOTO MENU
::?????????????
:checkConf 
	call :checkConfNginx
	GOTO MENU
::???????Nginx???????
:reloadConf 
    call :checkConfNginx
	call :reloadConfNginx
	GOTO MENU
	
::???nginx?·Ú
:showVersion 
    call :showVersionNginx
	GOTO MENU	
	
	
::*************************************************************************************
::???
::*************************************************************************************
:shutdownNginx
	echo. 
	echo.???Nginx......
	taskkill /F /IM nginx.exe > nul
	echo.OK,???????nginx ????
	goto :eof
:startNginx
	echo. 
	echo.???Nginx......
	IF NOT EXIST "%NGINX_DIR%nginx.exe" (
        echo "%NGINX_DIR%nginx.exe"??????
        goto :eof
     )
	%NGINX_PATH% 
	cd "%NGINX_DIR%"
	IF EXIST "%NGINX_DIR%nginx.exe" (
		echo "start '' nginx.exe"
		start "" nginx.exe
	)
	echo.OK
	echo ??????:http://127.0.0.1:18090/behavior/script/maidian.js
	goto :eof
	
 
:checkConfNginx
	echo. 
	echo.?????? nginx ???????......
	IF NOT EXIST "%NGINX_DIR%nginx.exe" (
        echo "%NGINX_DIR%nginx.exe"??????
        goto :eof
     )
	%NGINX_PATH% 
	cd "%NGINX_DIR%" 
	nginx -t -c conf/nginx.conf
 
	goto :eof
	
::??????? nginx ???????
:reloadConfNginx
	echo. 
	echo.??????? nginx ???????......
	IF NOT EXIST "%NGINX_DIR%nginx.exe" (
        echo "%NGINX_DIR%nginx.exe"??????
        goto :eof
     )
	%NGINX_PATH% 
	cd "%NGINX_DIR%" 
	nginx -s reload
 
	goto :eof
	
::???nginx?·Ú
:showVersionNginx
	echo. 
	%NGINX_PATH% 
	cd "%NGINX_DIR%" 
	nginx -V
 	goto :eof