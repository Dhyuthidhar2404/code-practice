@echo on
SETLOCAL EnableDelayedExpansion

echo ===============================================
echo  CodePractice Dependencies Installation Script
echo ===============================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
call node --version >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/ first.
    pause
    exit /b 1
)

REM Display Node.js version
echo Using Node.js version:
call node --version
echo.

REM Check if npm is installed
echo Checking npm installation...
call npm --version >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo npm is not installed or not in PATH.
    echo Please ensure npm is installed with Node.js.
    pause
    exit /b 1
)

REM Display npm version
echo Using npm version:
call npm --version
echo.

echo Choose your package manager:
echo 1. npm
echo 2. yarn
echo 3. pnpm
echo.
set /p pm="Enter the number (default is 1): "

IF "%pm%"=="" set pm=1
echo Selected package manager: %pm%

IF "%pm%"=="2" (
    call yarn --version >nul 2>nul
    IF !ERRORLEVEL! NEQ 0 (
        echo Yarn is not installed. Would you like to install it? (Y/N)
        set /p installYarn="Answer: "
        IF /I "!installYarn!"=="Y" (
            echo Installing Yarn...
            call npm install -g yarn
        ) ELSE (
            echo Proceeding with npm instead...
            set pm=1
        )
    )
)

IF "%pm%"=="3" (
    call pnpm --version >nul 2>nul
    IF !ERRORLEVEL! NEQ 0 (
        echo pnpm is not installed. Would you like to install it? (Y/N)
        set /p installPnpm="Answer: "
        IF /I "!installPnpm!"=="Y" (
            echo Installing pnpm...
            call npm install -g pnpm
        ) ELSE (
            echo Proceeding with npm instead...
            set pm=1
        )
    )
)

echo.
echo Creating a new project or installing in an existing one?
echo 1. Create a new Next.js project
echo 2. Install in current directory
echo.
set /p projectType="Enter the number (default is 2): "

IF "%projectType%"=="" set projectType=2
echo Selected project type: %projectType%

IF "%projectType%"=="1" (
    echo.
    set /p projectName="Enter project name: "
    
    IF "%pm%"=="1" (
        echo Creating new Next.js project with npm...
        call npx create-next-app@latest %projectName% --typescript --tailwind --eslint
        cd %projectName%
    )
    IF "%pm%"=="2" (
        echo Creating new Next.js project with yarn...
        call yarn create next-app %projectName% --typescript --tailwind --eslint
        cd %projectName%
    )
    IF "%pm%"=="3" (
        echo Creating new Next.js project with pnpm...
        call pnpm create next-app %projectName% --typescript --tailwind --eslint
        cd %projectName%
    )
)

echo.
echo Installing dependencies...
echo.

REM Set install command based on package manager with legacy-peer-deps for npm
IF "%pm%"=="1" (
    set install_cmd=call npm install --legacy-peer-deps
    set install_dev_cmd=call npm install --save-dev --legacy-peer-deps
)
IF "%pm%"=="2" (
    set install_cmd=call yarn add
    set install_dev_cmd=call yarn add --dev
)
IF "%pm%"=="3" (
    set install_cmd=call pnpm add --no-strict-peer-dependencies
    set install_dev_cmd=call pnpm add --save-dev --no-strict-peer-dependencies
)

REM Core Dependencies - Using compatible React 18 instead of 19
echo Installing Core Dependencies...
%install_cmd% react@^18.2.0 react-dom@^18.2.0 next@13.5.6

REM UI Components ^& Styling (fixed & symbol with ^ escape)
echo Installing UI Components and Styling...
%install_cmd% tailwindcss@^3.3.0 autoprefixer@^10.4.14 postcss@^8.4.24 tailwindcss-animate@^1.0.6 tailwind-merge@^1.13.2 class-variance-authority@^0.6.1 clsx@^2.0.0

REM Icons and UI Elements
echo Installing Icons and UI Elements...
%install_cmd% lucide-react@^0.294.0

REM Charts and Data Visualization
echo Installing Charts and Data Visualization...
%install_cmd% recharts@^2.9.0

REM Radix UI Components
echo Installing Radix UI Components...
%install_cmd% @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-popover @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-accordion @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-slider @radix-ui/react-switch

REM Form Handling
echo Installing Form Handling...
%install_cmd% react-hook-form@^7.45.4 @hookform/resolvers@^3.3.1 zod@^3.22.2

REM Date and Time Handling - Using compatible date-fns 2.x
echo Installing Date and Time Handling...
%install_cmd% date-fns@^2.30.0

REM Theming
echo Installing Theming...
%install_cmd% next-themes@^0.2.1

REM Development Dependencies
echo Installing Development Dependencies...
%install_dev_cmd% typescript@^5.1.6 @types/react@^18.2.20 @types/react-dom@^18.2.7 @types/node@^20.5.6

echo.
echo All dependencies have been installed!
echo.

echo Would you like to start the development server now? (Y/N)
set /p startDev="Answer: "
IF /I "%startDev%"=="Y" (
    IF "%pm%"=="1" call npm run dev
    IF "%pm%"=="2" call yarn dev
    IF "%pm%"=="3" call pnpm dev
)

echo.
echo Installation completed! Your CodePractice application is ready.
echo.

pause
ENDLOCAL