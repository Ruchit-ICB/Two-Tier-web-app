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
                    bat 'npm ci'
                }
            }
        }

        stage('Lint Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Run Backend Integration Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Build Frontend Artifacts') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Production Build') {
            steps {
                echo 'Building Docker production multi-stage image...'
                sh "docker build -t ${DOCKER_IMAGE_NAME}:${env.BUILD_ID} -t ${DOCKER_IMAGE_NAME}:latest -f backend/Dockerfile ."
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
