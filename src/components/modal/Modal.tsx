import React, {useEffect, useRef, useState} from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import {Alert, DialogContentText, Paper, TextField} from '@mui/material'
import style from './Modal.module.scss'
import {selectTreeData, store} from '../../app/store/store'
import {v4 as uuidv4} from 'uuid'
import {useDispatch} from 'react-redux'
import {addNode, checkIfNodeHasChildren, deleteNode, renameNode} from '../../app/model/treeSlice'

type ModalProps = {
  open: boolean;
  setOpen: (arg: boolean) => void;
  title: string;
  label: string;
  nodeName: string;
  nodeId?: string;
  parentId?: string;
};

export const Modal: React.FC<ModalProps> = ({
                                              open,
                                              setOpen,
                                              title,
                                              label,
                                              nodeName = '',
                                              nodeId,
                                              parentId,
                                            }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [newNodeName, setNewNodeName] = useState(title === 'Add' ? '' : nodeName)
  const [showAlert, setShowAlert] = useState(false)
  const dispatch = useDispatch()
  const treeData = selectTreeData(store.getState())

  const handleClose = (reason: string) => {
    if (reason !== 'backdropClick') {
      setOpen(false)
    }
  }
  const handleDelete = () => {
    if (nodeId != null) {
      const hasChildren = checkIfNodeHasChildren(treeData, nodeId)
      if (hasChildren) {
        setShowAlert(true)
      } else {
        dispatch(deleteNode(nodeId))
        setOpen(false)
      }
    }
  }

  const handleSave = () => {
    if (title === 'Rename') {
      if (nodeId) {
        dispatch(renameNode({nodeId, newName: newNodeName}))
      }
    } else if (title === 'Add') {
      if (nodeId && parentId) {
        const newNode = {id: generateUniqueId(), name: newNodeName}
        dispatch(addNode({parentId, newNode}))
      }
    }
    setNewNodeName('')
    setOpen(false)
  }

  const handleNodeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewNodeName(e.target.value)
  }

  const handleClickInsideInputWrapper = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  useEffect(() => {
    if (title === 'Add') {
      setNewNodeName('')
    } else {
      setNewNodeName(nodeName)
    }
  }, [title, nodeName])

  const generateUniqueId = () => {
    return uuidv4()
  }

  return (
    <Paper style={{padding: '10px', position: 'relative'}} onClick={handleClickInsideInputWrapper}>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        PaperProps={{
          className: style.customDialog,
        }}
      >
        <div className={style.title}>
          <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
        </div>
        <div className={style.label}>
          <DialogContent>
            {showAlert ? (
              <Alert severity='error'>
                "You have to delete all children nodes first"
              </Alert>
            ) : title === 'Delete' ? (
              <DialogContentText id='alert-dialog-description' className={style.delete}>
                {label}
              </DialogContentText>
            ) : (
              <TextField
                id='outlined-basic'
                value={newNodeName}
                label={label}
                variant='outlined'
                onChange={handleNodeNameChange}
                inputRef={inputRef}
                placeholder={title === 'Add' ? '' : nodeName}
                autoComplete='off'
              />
            )}
          </DialogContent>
        </div>
        <div className={style.button}>
          {showAlert ? (
            <DialogActions>
              <Button variant='contained' onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogActions>
          ) : (
            <DialogActions>
              {title === 'Delete' && (
                <Button variant='outlined' onClick={handleDelete} color='error'>
                  Delete
                </Button>
              )}
              {title === 'Add' && (
                <Button variant='contained' onClick={handleSave} autoFocus>
                  Add
                </Button>
              )}
              {title === 'Rename' && (
                <Button variant='contained' onClick={handleSave} autoFocus>
                  Rename
                </Button>
              )}
              <Button variant='outlined' onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogActions>
          )}
        </div>
      </Dialog>
    </Paper>
  )
}