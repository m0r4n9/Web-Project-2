$(document).ready(function () {
    const $table = $(".admin-panel__table");

    function editItem() {
        if ($("tbody").find("tr.editing").length) return;

        const parent = $(this).closest(".admin-panel__row");

        const originalValue = {};
        parent
            .addClass("editing")
            .children()
            .each(function () {
                const cell = $(this);
                const dataVal = cell.data("type");

                if (dataVal) {
                    originalValue[dataVal] = cell.text();
                    cell.html(
                        `<input type='text' name="${dataVal}" class='edit-input' value='${originalValue[dataVal].trim()}' ${dataVal === "id" ? "disabled" : ""} />`,
                    );
                }
            });

        const saveButton = $("<button class='save-button'>Сохранить</button>");
        const resetButton = $("<button class='reset-button'>Отменить</button>");

        const $editBtn = parent.children(".admin-panel__cell--actions").children(".edit-button");

        resetButton.click(function () {
            parent.children().each(function () {
                const cell = $(this);
                const dataVal = cell.data("type");
                if (dataVal) {
                    cell.html(originalValue[dataVal]);
                }
            });

            this.remove();
            saveButton.remove();
            $editBtn.show();
            parent.removeClass("editing");
        });

        parent.children(".admin-panel__cell--actions").append(saveButton, resetButton);
        $editBtn.hide();
    }

    $table.on("click", ".edit-button", function () {
        editItem.call(this);
    });

    $table.on("dblclick", ".admin-panel__cell", function () {
        editItem.call(this);
    });
});
