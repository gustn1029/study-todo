const $form = document.querySelector("form");
const $input = document.getElementById("todo-input");
const $ul = document.querySelector(".todoList");
const url = "http://localhost:3000/todos";

const fetchTodo = async () => {
  let result;
  try {
    const res = await fetch(url);
    result = await res.json();
  } catch (error) {
    result = console.error(error, "fetch error");
  }

  return result;
};

const getList = async () => {
  const todos = await fetchTodo();
  todos.forEach((todo) => {
    getTodo(todo);
  });
};

const getTodo = (data) => {
  const $li = `<li id="${data.id}">
        <p class=${data.done === true ? "done" : ""}>${data.todo}</p>
        <button class="edit-btn">수정</button>
        <button class="del-btn">삭제</button>
        <input type="checkbox" class="done-check" ${
          data.done ? "checked" : ""
        } />
    </li>`;
  $ul.insertAdjacentHTML("beforeend", $li);
};

const addOrEditTodo = async (url, method, data) => {
  const res = await fetch(url, {
    method: method,
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res;
};

const addTodo = async (e) => {
  e.preventDefault();
  const todoData = {
    todo: $input.value,
    done: false,
  };
  const res = await addOrEditTodo(url, "post", todoData);
  if (res.ok) {
    const data = res.json();
    getTodo(data);
  }
};

const todoDoneCheck = async (id, check) => {
  const checkData = {
    done: check,
  };

  const res = await addOrEditTodo(`${url}/${id}`, "PATCH", checkData);

  return res;
};

const removeTodo = async (id) => {
  const res = await fetch(`${url}/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    $ul.innerHTML = "";
    getList();
  } else {
    alert(`삭제에 실패했습니다. ${res.statusText}`);
  }
};

const editTodo = async (id, editText) => {
  const editData = {
    todo: editText,
  };
  const res = await addOrEditTodo(`${url}/${id}`, "PATCH", editData);

  return res;
};

const todoStatus = async (e) => {
  e.preventDefault();
  const target = e.target;
  const todoId = target.parentNode.id;
  if (target.classList.contains("del-btn")) {
    removeTodo(todoId);
  } else if (target.classList.contains("edit-btn")) {
    const editText = prompt(
      "수정할 일정을 입력해주세요.",
      target.previousElementSibling.textContent
    );

    if (editText) {
      const minLength = 2;
      if (editText.trim().length >= minLength) {
        const res = await editTodo(todoId, editText);
        if (res.ok) {
          const todo = await res.json();
          target.previousElementSibling.textContent = todo.todo;
        }
      } else {
        alert(`${minLength}자 이상 입력해주세요.`);
      }
    }
  } else if (target.classList.contains("done-check")) {
    const res = await todoDoneCheck(todoId, target.checked);
    if (res.ok) {
      const todo = await res.json();
      console.log(todo.done);
    }
  }
};

getList();

$form.addEventListener("submit", (e) => {
  addTodo(e);
});
$ul.addEventListener("click", todoStatus);
