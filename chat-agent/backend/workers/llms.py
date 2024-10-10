import openai
import instructor

from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI

MODEL = "mistral"
# MODEL = "gpt-4o-mini"
# MODEL = "gpt-4-turbo-preview"
APIKEY = "ollama"
TEMPERATURE = 0.1
BASEURL = "http://localhost:11434/v1"
# BASEURL = None
INSTRUCT_FC_MODE = instructor.Mode.MD_JSON


class BaseConfig:

    @property
    def _get_base_conf(self):
        base_config = {"api_key": APIKEY}
        if BASEURL:
            base_config.update({"base_url": BASEURL})
        return base_config

    @property
    def _get_model_conf(self):
        model_config = {"model": MODEL, "temperature": TEMPERATURE}
        return model_config

    @property
    def _get_instructor_mode(self):
        return INSTRUCT_FC_MODE

    @property
    def _get_model(self):
        return MODEL

    @property
    def _get_temperature(self):
        return TEMPERATURE


class Model:
    conf = BaseConfig()

    @classmethod
    def instructor_fc(cls, **kwargs):
        kwargs_ = cls.conf._get_base_conf
        kwargs_.update(kwargs)
        print("kwargs_", kwargs_)
        client = instructor.from_openai(
            openai.OpenAI(**kwargs_),
            mode=cls.conf._get_instructor_mode,
        )
        return client

    @classmethod
    def openai(cls, **kwargs):
        kwargs_ = cls.conf._get_base_conf
        kwargs_.update(kwargs)
        print("kwargs_", kwargs_)
        client = openai.OpenAI(**kwargs_)
        return client

    @classmethod
    def ollama_fc(cls, **kwargs):
        kwargs_ = cls.conf._get_base_conf
        kwargs_.update(cls.conf._get_model_conf)
        kwargs["format"] = "json"
        kwargs_.update(kwargs)
        print("kwargs_", kwargs_)
        client = ChatOllama(**kwargs_)
        return client

    @classmethod
    def ollama(cls, **kwargs):
        kwargs_ = cls.conf._get_base_conf
        kwargs_.update(cls.conf._get_model_conf)
        kwargs_.update(kwargs)
        print("kwargs_", kwargs_)
        client = ChatOllama(**kwargs_)
        return client

    @classmethod
    def langchain(cls, **kwargs):
        kwargs_ = cls.conf._get_base_conf
        kwargs_.update(cls.conf._get_model_conf)
        kwargs_.update(kwargs)
        print("kwargs_", kwargs_)
        client = ChatOpenAI(**kwargs_)
        return client


if __name__ == "__main__":
    client = Model.instructor_fc()
    client = Model.openai()
    client = Model.ollama(model=MODEL)
    client = Model.ollama_fc(model=MODEL)
    client = Model.langchain()
