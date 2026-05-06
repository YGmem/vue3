import jetbrains.buildServer.configs.kotlin.*
import jetbrains.buildServer.configs.kotlin.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.buildSteps.script
import jetbrains.buildServer.configs.kotlin.triggers.vcs

/*
The settings script is an entry point for defining a TeamCity
project hierarchy. The script should contain a single call to the
project() function with a Project instance or an init function as
an argument.

VcsRoots, BuildTypes, Templates, and subprojects can be
registered inside the project using the vcsRoot(), buildType(),
template(), and subProject() methods respectively.

To debug settings scripts in command-line, run the

    mvnDebug org.jetbrains.teamcity:teamcity-configs-maven-plugin:generate

command and attach your debugger to the port 8000.

To debug in IntelliJ Idea, open the 'Maven Projects' tool window (View
-> Tool Windows -> Maven Projects), find the generate task node
(Plugins -> teamcity-configs -> teamcity-configs:generate), the
'Debug' option is available in the context menu for the task.
*/

version = "2025.11"

project {

    buildType(HelloTemplateProd)
    buildType(HelloBuildPackage)
    buildType(HelloBuildBasic)
    buildType(HelloBuildTest)
    buildType(HelloTemplateDev)
    buildType(HelloBuildBuild)

    template(HelloCommonTemplate)
}

object HelloBuildBasic : BuildType({
    name = "hello-build-basic"

    params {
        param("build.env", "dev")
        param("skip.optional.step", "true")
        param("deploy.target", "sandbox")
        param("env.DEMO_GREETING", "hello-teamcity")
    }

    vcs {
        root(DslContext.settingsRoot)
    }

    steps {
        script {
            name = "01_echo_context_bj"
            id = "build001"
            scriptContent = """
                echo "TeamCity project id: %teamcity.project.id%"
                echo "TeamCity project name: %system.teamcity.projectName%"
                echo "Build number: %build.number%"
                echo "Server URL: %teamcity.serverUrl%"
                echo "build.env=%build.env%"
                echo "deploy.target=%deploy.target%"
                echo "env.DEMO_GREETING=%env.DEMO_GREETING%"
            """.trimIndent()
        }
        script {
            name = "02_optional_step"
            id = "two"

            conditions {
                equals("skip.optional.step", "false")
            }
            scriptContent = """
                echo "optional step is running"
                echo "current build.env=%build.env%"
            """.trimIndent()
        }
    }

    triggers {
        vcs {
            branchFilter = ""
            enableQueueOptimization = false
        }
    }

    features {
        perfmon {
        }
    }
})

object HelloBuildBuild : BuildType({
    name = "hello-build-build"

    artifactRules = "build-output.txt"

    params {
        param("build.env", "dev")
        param("skip.optional.step", "true")
        param("deploy.target", "sandbox")
        param("env.DEMO_GREETING", "hello-teamcity")
    }

    vcs {
        root(DslContext.settingsRoot)
    }

    steps {
        script {
            name = "01_echo_context"
            id = "build001"
            scriptContent = """
                echo "artifact from build stage" > build-output.txt
                echo "build stage done"
                echo "build.env=%build.env%"
            """.trimIndent()
        }
    }

    triggers {
        vcs {
            branchFilter = ""
            enableQueueOptimization = false
        }
    }

    features {
        perfmon {
        }
    }
})

object HelloBuildPackage : BuildType({
    name = "hello-build-package"

    params {
        param("build.env", "dev")
        param("skip.optional.step", "true")
        param("deploy.target", "sandbox")
        param("env.DEMO_GREETING", "hello-teamcity")
    }

    vcs {
        root(DslContext.settingsRoot)
    }

    steps {
        script {
            name = "01_echo_context"
            id = "build001"
            scriptContent = """
                echo "package stage started"
                echo "this build should receive artifact from hello-build-build"
                cat input/build-output.txt
            """.trimIndent()
        }
    }

    triggers {
        vcs {
            branchFilter = ""
            enableQueueOptimization = false
        }
    }

    features {
        perfmon {
        }
    }

    dependencies {
        snapshot(HelloBuildTest) {
        }
        artifacts(HelloBuildBuild) {
            artifactRules = "build-output.txt => input"
        }
    }
})

object HelloBuildTest : BuildType({
    name = "hello-build-test"

    params {
        param("build.env", "dev")
        param("skip.optional.step", "true")
        param("deploy.target", "sandbox")
        param("env.DEMO_GREETING", "hello-teamcity")
    }

    vcs {
        root(DslContext.settingsRoot)
    }

    steps {
        script {
            name = "01_echo_context"
            id = "build001"
            scriptContent = """
                echo "test stage started"
                echo "this build should run after hello-build-build"
            """.trimIndent()
        }
    }

    triggers {
        vcs {
            branchFilter = ""
            enableQueueOptimization = false
        }
    }

    features {
        perfmon {
        }
    }

    dependencies {
        snapshot(HelloBuildBuild) {
        }
    }
})

object HelloTemplateDev : BuildType({
    templates(HelloCommonTemplate)
    name = "hello-template-dev"

    vcs {
        root(DslContext.settingsRoot)
    }

    features {
        perfmon {
            id = "perfmon"
        }
    }
})

object HelloTemplateProd : BuildType({
    templates(HelloCommonTemplate)
    name = "hello-template-prod"

    params {
        param("build.env", "production")
    }

    vcs {
        root(DslContext.settingsRoot)
    }

    features {
        perfmon {
            id = "perfmon"
        }
    }
})

object HelloCommonTemplate : Template({
    name = "hello-common-template"
    description = "测试模板"

    params {
        param("build.env", "dev")
        param("system.demo.mode", "template-mode")
        param("env.DEMO_GREETING", "hello-from-template")
    }

    steps {
        script {
            name = "01_echo_template_context"
            id = "echo_template_context_01"
            scriptContent = """
                echo "from template"
                echo "build.env=%build.env%"
                echo "env.DEMO_GREETING=%env.DEMO_GREETING%"
                echo "system.demo.mode=%system.demo.mode%"
            """.trimIndent()
        }
    }
})
