import { AddModuleModalProps, MainModule } from "../../type_interface/SettingType";
import { Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useAppLoading } from "../../context/AppLoadingContext";
import { useAlertModal } from "../../context/ModalContext";
import { getSortOrder, getMainModuleList } from "../../services/settingServices";

const AddEditModuleModal = (props: AddModuleModalProps) => {

    const { isLoading } = useAppLoading();
    const { alertMessage } = useAlertModal();
    const [mainModuleList, setMainModuleList] = useState<MainModule[]>([]);

    const {
        isEdit,
        isModalShow,
        formData,
        handleChange,
        handleSubmit,
        handleSubmitEdit,
        handleClose,
        handleDelete
    } = props;

    const fetchMainModuleList = async () => {
        try {
            let result = await getMainModuleList();
            if (result) {
                if (result.success) {
                    let data = result.data as MainModule[];
                    setMainModuleList(data);
                }
            } else {
                throw new Error("getMainModuleList returns error.");
            }
        } catch (e) {
            console.error(e);
            console.log("fetchMainModuleList returns error.");
        }
    }

    useEffect(() => {
        fetchMainModuleList();
    }, [])
    
    const handlePermissionEdit = (action: string) => {
        let pmList = [...formData.permission_list];
        if (pmList.includes(action)) {
            pmList.splice(pmList.indexOf(action), 1)
        } else {
            pmList.push(action);
        }
        handleChange({
            target: {
                name: "permission_list",
                value: pmList
            }
        } as any);
    }

    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        let { name, value } = e.target;
        handleChange({
            target: {
                name: name,
                value: value
            }
        } as any);
        try {
            let result = await getSortOrder(value);
            if (result) {
                if (result.success) {
                    handleChange({
                        target: {
                            name: "sort_order",
                            value: result.data
                        }
                    } as any);
                } else {
                    alertMessage(result.message);
                }
            } else {
                throw new Error("getSortOrder returns error.");
            }
        } catch (e) {
            console.error(e);
            alertMessage("เกิดข้อผิดพลาดระหว่างประมวลผล");
        }
    }

    const modalContent = !isModalShow ? null : (
        <>
            <div className="fade modal-backdrop show" style={{ zIndex: "7998" }}></div>
            <div role="dialog" aria-modal="true"
                className="fade modal show" tabIndex={-1}
                style={{ display: "flex", zIndex: "7999", justifyContent: "center", alignItems: "center" }}>

                <div className="custom-modal-content custom-modal-w-700px">
                    <div className="modal-header">
                        <h5 className="modal-title">{isEdit ? "แก้ไข" : "เพิ่ม"} Module</h5>
                    </div>

                    <Form onSubmit={isEdit ? handleSubmitEdit : handleSubmit}>
                        <div className="modal-body module_body">

                            <div className="modal-display-grid-3-col">
                                <div>
                                    <label className="form-label required">
                                        รหัสเมนู
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="module_code"
                                        value={formData.module_code}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="form-label required">
                                        ชื่อเมนู
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="module_name"
                                        value={formData.module_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <Form.Group controlId="formLevel">
                                    <Form.Label>
                                        ระดับ <span style={{ color: "red" }}>*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                    >
                                        <option disabled value={0}></option>
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                    </Form.Select>
                                </Form.Group>

                                {
                                    formData.level != 2 ? null
                                    :
                                    <Form.Group controlId="formVehicleType">
                                        <Form.Label>
                                            เมนูหลัก <span style={{ color: "red" }}>*</span>
                                        </Form.Label>
                                        <Form.Select
                                            name="parent_id"
                                            value={formData.parent_id}
                                            onChange={handleSelect}
                                        >
                                            <option disabled value=""></option>
                                            {mainModuleList.map((mainModule: MainModule) => (
                                                <option key={mainModule.module_id} value={mainModule.module_id}>
                                                    {mainModule.module_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                }
                                <div>
                                    <label className="form-label required">
                                        ลำดับที่
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="sort_order"
                                        value={formData.sort_order}
                                        onChange={handleChange}
                                        required
                                        disabled={formData.level == 2}
                                    />
                                </div>
                            </div>

                            <div className="modal-display-grid-4-col" style={{ marginTop: "10px" }}>
                                <div style={{ display: "flex", alignItems: "flex-end" }}>
                                    <input
                                        id="select-view"
                                        type="checkbox"
                                        onChange={() => handlePermissionEdit("view")}
                                        checked={formData.permission_list.includes("view")}
                                        style={{ height: "30px", width: "20px", marginRight: "10px" }}
                                    />
                                    <label htmlFor="select-view" style={{ fontSize: "16px" }}>View</label>
                                </div>
                                <div style={{ display: "flex", alignItems: "flex-end" }}>
                                    <input
                                        id="select-edit"
                                        type="checkbox"
                                        onChange={() => handlePermissionEdit("edit")}
                                        checked={formData.permission_list.includes("edit")}
                                        style={{ height: "30px", width: "20px", marginRight: "10px" }}
                                    />
                                    <label htmlFor="select-edit" style={{ fontSize: "16px" }}>Edit</label>
                                </div>
                                <div style={{ display: "flex", alignItems: "flex-end" }}>
                                    <input
                                        id="select-create"
                                        type="checkbox"
                                        onChange={() => handlePermissionEdit("create")}
                                        checked={formData.permission_list.includes("create")}
                                        style={{ height: "30px", width: "20px", marginRight: "10px" }}
                                    />
                                    <label htmlFor="select-create" style={{ fontSize: "16px" }}>Create</label>
                                </div>
                                <div style={{ display: "flex", alignItems: "flex-end" }}>
                                    <input
                                        id="select-delete"
                                        type="checkbox"
                                        onChange={() => handlePermissionEdit("delete")}
                                        checked={formData.permission_list.includes("delete")}
                                        style={{ height: "30px", width: "20px", marginRight: "10px" }}
                                    />
                                    <label htmlFor="select-delete" style={{ fontSize: "16px" }}>Delete</label>
                                </div>
                            </div>

                        </div>

                        <div className="modal-footer" style={{justifyContent: "space-between"}}>
                            {
                                !isEdit ? <div></div> :
                                <button type="button" className="btn btn-danger" onClick={() => handleDelete(formData)}>
                                    ลบ
                                </button>
                            }
                            <div>
                                <button 
                                    type="button" className="btn btn-light" onClick={handleClose}
                                    style={{marginRight: "20px"}}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary"
                                    disabled={
                                        !formData.module_name
                                        || !formData.module_code
                                        || !formData.level
                                        || formData.permission_list.length === 0
                                        || isLoading
                                    }>
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </Form>
                </div>

            </div>
        </>
    );

    return <>{modalContent}</>

}

export default AddEditModuleModal