pipeline {
    agent any

    environment {
        // Define global environment variables here
        NODE_ENV = 'test'
        DOCKER_IMAGE_NAME = 'tasksphere-web'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Repository cloned successfully.'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm ci'
                }
                dir('frontend') {
                    bat 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('Lint Frontend') {
            steps {
                dir('frontend') {
                    bat 'node_modules\\.bin\\eslint . --max-warnings 0'
                }
            }
        }

        stage('Run Backend Integration Tests') {
            steps {
                dir('backend') {
                    bat 'npm test'
                }
            }
        }

        stage('Build Frontend Artifacts') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Docker Production Build') {
            steps {
                echo 'Building Docker production multi-stage image...'
                bat "docker build -t ${DOCKER_IMAGE_NAME}:${env.BUILD_ID} -t ${DOCKER_IMAGE_NAME}:latest -f backend/Dockerfile ."
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution complete.'
        }
        success {
            echo 'All stages completed successfully! The application is ready for deployment.'
        }
        failure {
            echo 'Pipeline failed. Please review the logs.'
            // Here you can add notifications (Slack, Email)
        }
    }
}
