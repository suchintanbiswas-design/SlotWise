@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------

@IF "%__MVN_ENV_SET__%"=="" (
  @SET __MVN_ENV_SET__=1
  @SETLOCAL
)

@SET MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
@IF NOT "%MAVEN_PROJECTBASEDIR%"=="" GOTO ...doneStart
@SET "EXEC_DIR=%~dp0"
@SET "MAVEN_PROJECTBASEDIR=%EXEC_DIR%"

:...doneStart

@SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@IF NOT EXIST "%JAVA_HOME%\bin\java.exe" (
  @SET "JAVACMD=java.exe"
) ELSE (
  @SET "JAVACMD=%JAVA_HOME%\bin\java.exe"
)

"%JAVACMD%" %MAVEN_OPTS% -classpath %WRAPPER_JAR% "-Dmaven.home=%MAVEN_PROJECTBASEDIR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %*
@IF ERRORLEVEL 1 GOTO error
@GOTO end

:error
@SET ERROR_CODE=1

:end
@IF "%__MVN_ENV_SET__%"=="1" (
  @ENDLOCAL
)
@EXIT /B %ERROR_CODE%

