import { signLearnosityRequest } from "./signLearnosityRequest";
import { loadScript } from "./loadScript";
import { getScriptUrl, getBaseUrl } from "./util";

const questionTypeModules = import.meta.glob("./questions/*/custom_question_type.json", {
  eager: true,
});

const questionTemplateModules = import.meta.glob("./questions/*/custom_question_template.json", {
  eager: true,
});

function replaceBaseUrl(json, baseUrl) {
  return JSON.parse(JSON.stringify(json).split("{BASE_URL}").join(baseUrl));
}

function getModuleDefault(module) {
  return module && typeof module === "object" && "default" in module ? module.default : module;
}

function getLearnosityRequest() {
  const baseUrl = getBaseUrl();
  const customQuestionTypes = Object.keys(questionTypeModules)
    .sort()
    .map((path) => replaceBaseUrl(getModuleDefault(questionTypeModules[path]), baseUrl));

  const questionTypeTemplates = Object.keys(questionTemplateModules)
    .sort()
    .reduce((acc, path) => {
      return {
        ...acc,
        ...replaceBaseUrl(getModuleDefault(questionTemplateModules[path]), baseUrl),
      };
    }, {});

  return {
    mode: "activity_list",
    config: {
      item_edit: {
        item: {
          actions: { show: true },
          status: { show: true },
          title: { show: true },
          reference: { show: true },
        },
      },
      dependencies: {
        question_editor_api: {
          init_options: {
            custom_question_types: customQuestionTypes,
            question_type_templates: questionTypeTemplates,
          },
        },
      },
    },
    user: {
      id: "demos-site",
      firstname: "Demos",
      lastname: "User",
      email: "demos@learnosity.com",
    },
  };
}

function createContainer() {
  const container = document.createElement("div");
  container.innerHTML = `<div><div id="learnosity-author"></div></div>`;
  return container;
}

export async function runAuthoring() {
  await loadScript(getScriptUrl("authorapi"));

  const container = createContainer();
  document.body.appendChild(container);

  const data = await signLearnosityRequest(getLearnosityRequest());

  window.LearnosityAuthor.init(data, {
    readyListener() {
      console.log("Learnosity Author API ready");
    },
    errorListener(err) {
      console.error("Learnosity Author API error:", err);
    },
  });
}
