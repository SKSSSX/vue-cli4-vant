pipeline {
    agent{
       docker {
            image env.DOCKER_FARM_IMAGE_NODEJS
            label env.DOCKER_FARM_LABEL
            args  env.DOCKER_FARM_ARGS
        }
    }
    environment{
        DIR_PATH='/opt/unicloud/pco/sales'
        ANSIBLE_PATH='/opt/unicloud/ansible'
    }
    options {
        gitLabConnection(env.gitlabConnection)
        gitlabBuilds(builds: ['checkout', 'clean',  'compile'])
        timestamps()
    }

    post {
        always { step([$class: 'WsCleanup']) }
        success {
            addGitLabMRComment comment: ':white_check_mark: Jenkins Build SUCCESS\n\n' +
                    "Results available at: [Jenkins [${env.JOB_BASE_NAME} ${env.BUILD_DISPLAY_NAME}]](${env.BUILD_URL})"
        }
        failure {
            addGitLabMRComment comment: ':negative_squared_cross_mark: Jenkins Build Failure\n\n' +
                    "Results available at: [Jenkins [${env.JOB_BASE_NAME} ${env.BUILD_DISPLAY_NAME}]](${env.BUILD_URL})"
        }
    }
    stages {
        stage('checkout') {
            post {
                success { updateGitlabCommitStatus name: 'checkout', state: 'success' }
                failure { updateGitlabCommitStatus name: 'checkout', state: 'failed' }
            }
            steps {
                script{
                    checkoutDependOnEnv env
                }
            }
        }
        stage('clean') {
            post {
                success { updateGitlabCommitStatus name: 'clean', state: 'success' }
                failure { updateGitlabCommitStatus name: 'clean', state: 'failed'  }
            }
            steps {
                sh """
                    git clean -fxd
                """
            }
        }
        stage('download-module') {
            post {
                success { updateGitlabCommitStatus name: 'download-module', state: 'success' }
                failure { updateGitlabCommitStatus name: 'download-module', state: 'failed' }
            }
            steps {
                script{
                    def server = Artifactory.server(env.ARTIFACTORY_SERVER_ID)
                    def downloadSpec = """{
                        "files": [
                          {
                              "pattern": " mavens/h3cloud-tools/node_modules/verify-record-20201218/*",
                              "target": "./node_modules/",
                              "flat": "true",
                              "explode": "true"
                          }]
                    }"""
                    server.download(downloadSpec)
                    sh "chmod -R +x node_modules/.bin"
                }
            }
        }
        stage('build'){
            post {
                success { updateGitlabCommitStatus name: 'build', state: 'success'  }
                failure { updateGitlabCommitStatus name: 'build', state: 'failed'  }
            }
            steps{
                sh """
                    npm run build
                """
            }
        }
        stage('package')
        {
             steps
             {
                sh """
                envsubst < ansible.yaml.template > ansible.yaml
                envsubst < install.sh.template > install.sh
                cd dist/
                tar -czvf ../${JOB_NAME}-${BUILD_VERSION}.tar.gz `ls`
                cd ../
                tar -czvf ${JOB_NAME}.tar.gz  ansible.yaml  install.sh ${JOB_NAME}-${BUILD_VERSION}.tar.gz
                rm -rf  ${JOB_NAME}-${BUILD_VERSION}.tar.gz
                mv ${JOB_NAME}.tar.gz ${JOB_NAME}-${BUILD_VERSION}.tar.gz
                """
             }
        }
        stage('publish') {
            post {
                success { updateGitlabCommitStatus name: 'publish', state: 'success'  }
                failure { updateGitlabCommitStatus name: 'publish', state: 'failed'  }
            }
            steps {
                script {
                    def uploadSpec = """{
                        "files": [
                            {
                                "pattern": "${JOB_NAME}-${BUILD_VERSION}.tar.gz",
                                "target": "${env.COMPONENTS_REPO}/unicloud/pco/${JOB_NAME}/${BUILD_VERSION}/"
                            }
                        ]
                    }"""

                    def server = Artifactory.server(env.ARTIFACTORY_SERVER_ID)
                    def buildInfo = Artifactory.newBuildInfo()
                    server.upload(uploadSpec, buildInfo)

                    //buildInfo.env.capture = true
                    //buildInfo.env.collect()
                    //server.publishBuildInfo(buildInfo)
                }
            }
        }
        stage('sonar-check') {
            //触发条件，正则匹配
            when { expression { env.BUILD_VERSION ==~ '.*test.*'} }
            post {
                success {
                    updateGitlabCommitStatus name: 'sonar', state: 'success'
                }
                failure {
                    updateGitlabCommitStatus name: 'sonar', state: 'failed'
                }
            }
            steps {
                sh """
                    /home/sonar-scanner/bin/sonar-scanner
                """
            }
        }
        stage('deploy')
        {

            post {
                success { updateGitlabCommitStatus name: 'deploy', state: 'success'  }
                failure { updateGitlabCommitStatus name: 'deploy', state: 'failed'  }
            }
            steps {
              script {
                if ( master == 'NULL' ) {
                    sh 'echo no master' 
                } else {
                    sh """
                        sshpass -p yunying123@ scp -oStrictHostKeyChecking=no ${JOB_NAME}-${BUILD_VERSION}.tar.gz root@${master}:/root/${JOB_NAME}-${BUILD_VERSION}.tar.gz
                        sshpass -p yunying123@ ssh -oStrictHostKeyChecking=no root@${master}  "cd /root && rm -rf ${JOB_NAME}/${BUILD_VERSION} && mkdir -p  ${JOB_NAME}/${BUILD_VERSION}  "
                        sshpass -p yunying123@ ssh -oStrictHostKeyChecking=no root@${master}  "tar -zxvf ${JOB_NAME}-${BUILD_VERSION}.tar.gz -C  ${JOB_NAME}/${BUILD_VERSION}"
                        sshpass -p yunying123@ ssh -oStrictHostKeyChecking=no root@${master}  "cd ${JOB_NAME}/${BUILD_VERSION} && bash install.sh"
                        """
                }
              }
            }
        }
    }
}