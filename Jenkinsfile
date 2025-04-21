pipeline {
    agent any

    environment {
        GITHUB_REPO_URL    = "https://github.com/xyrova/file-sharer.git"
        GIT_DEFAULT_BRANCH = "anjal"
        FRONTEND_ECR_REPO  = "529088299058.dkr.ecr.ap-south-1.amazonaws.com/dev/frontend"
        BACKEND_ECR_REPO   = "529088299058.dkr.ecr.ap-south-1.amazonaws.com/dev/backend"
        AWS_REGION         = "ap-south-1"
    }

    parameters {
        string(name: 'GIT_BRANCH_PARAM', defaultValue: env.GIT_DEFAULT_BRANCH, description: 'Git branch to check out and deploy')
    }

    stages {

        stage('Initialize') {
            steps {
                echo "======================"
                echo "Initializing Pipeline"
                echo "Target branch: ${params.GIT_BRANCH_PARAM}"
                echo "======================"
                echo "Cleaning workspace..."
                cleanWs()
            }
        }

        stage('Checkout Source') {
            steps {
                echo "======================"
                echo "Checking out Source"
                echo "======================"
                script {
                    try {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: params.GIT_BRANCH_PARAM]],
                            userRemoteConfigs: [[
                                url: env.GITHUB_REPO_URL
                            ]]
                        ])
                        echo "Checkout complete."
                    } catch (err) {
                        error "Failed to checkout: ${err}"
                    }
                }

                echo "Listing the project files:"
                sh 'ls -la'
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo "======================"
                echo "Building Frontend Docker Image"
                echo "======================"
                dir('frontend') {
                    script {
                        def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                        def imageTag = "${env.FRONTEND_ECR_REPO}:${commitHash}"
                        docker.build(imageTag, '.')
                        env.FRONTEND_IMAGE_TAG = imageTag
                    }
                }
                echo "Frontend image built successfully with tag: ${env.FRONTEND_IMAGE_TAG}"
            }
        }

        stage('Push Frontend Image to ECR') {
            steps {
                echo "======================"
                echo "Pushing Frontend Image to ECR"
                echo "======================"
                script {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                    credentialsId: 'aws-credentials-id',
                                    accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                        sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.FRONTEND_ECR_REPO}"
                        sh "docker push ${env.FRONTEND_IMAGE_TAG}"
                    }
                    echo "Frontend image pushed successfully to ECR: ${env.FRONTEND_IMAGE_TAG}"
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                echo "======================"
                echo "Building Backend Docker Image"
                echo "======================"
                dir('backend') {
                    script {
                        def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                        def imageTag = "${env.BACKEND_ECR_REPO}:${commitHash}"
                        docker.build(imageTag, '.')
                        env.BACKEND_IMAGE_TAG = imageTag
                    }
                }
                echo "Backend image built successfully with tag: ${env.BACKEND_IMAGE_TAG}"
            }
        }

        stage('Push Backend Image to ECR') {
            steps {
                echo "======================"
                echo "Pushing Backend Image to ECR"
                echo "======================"
                script {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                    credentialsId: 'aws-credentials-id',
                                    accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                        sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.BACKEND_ECR_REPO}"
                        sh "docker push ${env.BACKEND_IMAGE_TAG}"
                    }
                    echo "Backend image pushed successfully to ECR: ${env.BACKEND_IMAGE_TAG}"
                }
            }
        }

        // stage('Deploy to EKS') { ... } PENDING STAGE....
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}