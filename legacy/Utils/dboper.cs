using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.UI.WebControls;
using System.Collections;
using Microsoft.Web.UI.WebControls;

namespace wsjxht
{
	public class dboper : Base
	{
		public string table;
		private SqlConnection myCn ;			

		public dboper ()
		{
			myCn = new SqlConnection(ConfigurationSettings.AppSettings["strConnection"]);
			myCn.Open ();
		}

		public dboper (bool flag)
		{
			if (flag)
			{
				myCn = new SqlConnection(ConfigurationSettings.AppSettings["strConnection"]);
				myCn.Open ();
			}
		}

		public void shutdown ()
		{
			myCn.Close ();
			myCn.Dispose ();
		}

		public SqlDataReader GetData (string cmd)
		{
			SqlDataReader dr = ExecuteSqlReader(myCn,cmd);
			return dr;
		}

		public void AddData (string cmd)
		{
			ExecuteSql (cmd);
		}

		public void Exec (string cmd)
		{
			ExecuteSql (cmd);
		}

		public void TranExec (string cmd)
		{
			TanExecuteSql(cmd);
		}
	
		public bool IsExists (string cmd)
		{
			return IsValuesExists (cmd);
		}

		public DataSet ReturnDt (string cmd,string tablesrc)
		{
			return ExecuteSql4Ds (cmd,tablesrc);
		}

		public void AppendDataSet (string strSQL,string tablesrc,ref DataSet ds)
		{
			FillDataSet (strSQL,tablesrc,ref ds);
		} 

		/// <summary>
		/// 执行存储过程
		/// </summary>
		/// <param name="procName">存储过程的名称</param>
		/// <param name="prams">存储过程所需参数</param>
		/// <param name="dataReader">存储过程所需参数</param>
		public void RunProc(string procName, SqlParameter[] prams, out SqlDataReader dataReader) 
		{
			SqlCommand cmd = CreateCommand(procName, prams);
			dataReader = cmd.ExecuteReader(System.Data.CommandBehavior.CloseConnection);
			//return (int)cmd.Parameters["ReturnValue"].Value;
		}

		/// <summary>
		/// 创建一个SqlCommand对象以此来执行存储过程
		/// </summary>
		/// <param name="procName">存储过程的名称</param>
		/// <param name="prams">存储过程所需参数</param>
		/// <returns>返回SqlCommand对象</returns>
		private SqlCommand CreateCommand(string procName, SqlParameter[] prams) 
		{
			SqlCommand cmd = new SqlCommand(procName, myCn);
			cmd.CommandType = CommandType.StoredProcedure;

			// 依次把参数传入存储过程
			if (prams != null) 
			{
				foreach (SqlParameter parameter in prams)
					cmd.Parameters.Add(parameter);
			}
			
			// 加入返回参数
			cmd.Parameters.Add(
				new SqlParameter("ReturnValue", SqlDbType.Int, 4,
				ParameterDirection.ReturnValue, false, 0, 0,
				string.Empty, DataRowVersion.Default, null));

			return cmd;

		}

		/// <summary>
		/// 传入输入参数
		/// </summary>
		/// <param name="ParamName">存储过程名称</param>
		/// <param name="DbType">参数类型</param></param>
		/// <param name="Size">参数大小</param>
		/// <param name="Value">参数值</param>
		/// <returns>新的 parameter 对象</returns>
		public SqlParameter MakeInParam(string ParamName, SqlDbType DbType, int Size, object Value) 
		{
			return MakeParam(ParamName, DbType, Size, ParameterDirection.Input, Value);
		}		

		/// <summary>
		/// 传入返回值参数
		/// </summary>
		/// <param name="ParamName">存储过程名称</param>
		/// <param name="DbType">参数类型</param>
		/// <param name="Size">参数大小</param>
		/// <returns>新的 parameter 对象</returns>
		public SqlParameter MakeOutParam(string ParamName, SqlDbType DbType, int Size) 
		{
			return MakeParam(ParamName, DbType, Size, ParameterDirection.Output, null);
		}		

		/// <summary>
		/// 传入返回值参数
		/// </summary>
		/// <param name="ParamName">存储过程名称</param>
		/// <param name="DbType">参数类型</param>
		/// <param name="Size">参数大小</param>
		/// <returns>新的 parameter 对象</returns>
		public SqlParameter MakeReturnParam(string ParamName, SqlDbType DbType, int Size) 
		{
			return MakeParam(ParamName, DbType, Size, ParameterDirection.ReturnValue, null);
		}	
	
		/// <summary>
		/// 生成存储过程参数
		/// </summary>
		/// <param name="ParamName">存储过程名称</param>
		/// <param name="DbType">参数类型</param>
		/// <param name="Size">参数大小</param>
		/// <param name="Direction">参数方向</param>
		/// <param name="Value">参数值</param>
		/// <returns>新的 parameter 对象</returns>
		public SqlParameter MakeParam(string ParamName, SqlDbType DbType, Int32 Size, ParameterDirection Direction, object Value) 
		{
			SqlParameter param;

			if(Size > 0)
				param = new SqlParameter(ParamName, DbType, Size);
			else
				param = new SqlParameter(ParamName, DbType);

			param.Direction = Direction;
			if (!(Direction == ParameterDirection.Output && Value == null))
				param.Value = Value;

			return param;
		}

		
		/// </summary>
		/// <param name="f_key">数据库表关键字key值名</param>
		/// <param name="f_parentkey">数据库表保存父节点id值字段名</param>
		/// <param name="f_text">节点显示文字树数据库表字段名</param>
		/// <param name="str_Sql">Select-SQL语句</param>
		/// <param name="Frame">单击树节点时连接的目标框架</param>
		/// <param name="Url">单击时连接网页名</param>
		/// <param name="TreeView1">TreeView控件id值</param>
	
		public void  BindTreeView(string Frame,string Url,TreeView TreeView1)
		{
			//TreeView1.Nodes.Clear(); // 清空树
			TreeNode root = TreeView1.Nodes[0];
			TreeNode node=new TreeNode();
			node.Text="在线项目学习"; // 给节点绑定显示值
			node.NodeData="root"; // 给节点绑定key值
			node.Expanded=true;//　默认根结点为展开
			node.Type = "root";
			if (Frame != "")
				node.Target = Frame;
			if (Url != "")
				node.NavigateUrl = Url;
			root.Nodes.Add (node);

			string cmd = "select dxbh,dxmc from t_jydx";
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				CreateNode0(r["dxbh"].ToString (),r["dxmc"].ToString (),Frame,"continue/xk_manage.aspx",node);//　加入所有根结点以下的结点　												
		}

		public void CreateNode0(string f_key,string f_text, string Frame,string Url,TreeNode parentnode)
		{
			TreeNode tempnode = CreateOneNode (f_key,f_text,Frame,Url,parentnode,true);

			string cmd = "select xk_id,xk_name from t_jyxk where dxbh=" + f_key;
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				CreateNode1(r["xk_id"].ToString (),r["xk_name"].ToString (),Frame,"continue/kc_manage.aspx",tempnode);//　加入所有根结点以下的结点　												
		}

		/// <summary>
		/// 重载2：绑定树控件并显示——>节点有连接,连接传递一个参数,传递的参数是location
		/// </summary>
		/// <param name="f_key">数据库表关键字key值名</param>
		/// <param name="f_parentkey">数据库表保存父节点id值字段名</param>
		/// <param name="f_text">节点显示文字树数据库表字段名</param>
		/// <param name="str_Sql">Select-SQL语句</param>
		/// <param name="Frame">单击树节点时连接的目标框架</param>
		/// <param name="Url">单击时连接网页名</param>
		/// <param name="TreeView1">TreeView控件id值</param>
		
		public void CreateNode1(string f_key,string f_text, string Frame,string Url,TreeNode parentnode)
		{
			TreeNode tempnode = CreateOneNode (f_key,f_text,Frame,Url,parentnode,true);

			string cmd = "select kcbt_id,kcbt_name from t_kc where xk_id = '" + f_key + "'";
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				CreateNode2(r["kcbt_id"].ToString (),r["kcbt_name"].ToString (),Frame,"continue/kj_manage.aspx",tempnode);//　加入所有根结点以下的结点　
		}

		public void CreateNode2(string f_key,string f_text,string Frame,string Url,TreeNode parentnode)
		{
			TreeNode tempnode = CreateOneNode (f_key,f_text,Frame,Url,parentnode,false);

		//	string cmd = "select st_id,st_name,storageid from t_st where kcbt_id = '" + f_key + "'";
		//	DataTable dt = GetTable(cmd);
		//	DataRow [] drs = dt.Select ();//　选出所有子节点
		//	foreach( DataRow r in drs )
		//		CreateNode3(r["storageid"].ToString (),r["st_name"].ToString (),Frame,"continue/topic_manage.aspx",tempnode);//　加入所有根结点以下的结点　
		}

		public void CreateNode3(string f_key,string f_text,string Frame,string Url,TreeNode parentnode)
		{
			TreeNode tempnode = CreateOneNode (f_key,f_text,Frame,Url,parentnode,false);

			string cmd = "select ques_id,ques_body from t_question where storageid = " + f_key;
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				CreateOneNode(r["ques_id"].ToString (),r["ques_body"].ToString (),Frame,"continue/topic_ask_add.aspx",tempnode,false);//　加入所有根结点以下的结点　
		}

		public void StorageCreateNode3(string f_key,string f_text,string Frame,string Url,TreeNode parentnode)
		{
			TreeNode tempnode = CreateOneNode (f_key,f_text,Frame,Url,parentnode,false);

			string cmd = "select ques_id,ques_body from t_question where storageid =" + f_key;
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				CreateOneNode(r["ques_id"].ToString (),r["ques_body"].ToString (),Frame,"topic_ask_add.aspx",tempnode,false);//　加入所有根结点以下的结点　
	
		}

		public TreeNode CreateOneNode(string f_key,string f_text,string Frame,string Url,TreeNode parentnode,bool ifopen)
		{
			TreeNode tempnode = new TreeNode();
			tempnode.Text = f_text;
			tempnode.NodeData = f_key;
			parentnode.Nodes.Add(tempnode);
			tempnode.Expanded=ifopen;
			if (Frame != "")
				tempnode.Target = Frame;
			if (Url != "")
				tempnode.NavigateUrl = Url + "?id=" + f_key ;
			return tempnode;
		}
	
		//创建成人教育后台管理树
		public void  AuditBindTreeView(string Frame,string Url,TreeView TreeView1,int type)
		{
			//TreeView1.Nodes.Clear(); // 清空树
			TreeNode root = TreeView1.Nodes[0];
			TreeNode node = root.Nodes[4];

			node.NodeData="root"; // 给节点绑定key值
			node.Expanded=false;//　默认根结点为展开
			node.Type = "root";
			if (Frame != "")
				node.Target = Frame;
			if (Url != "")
				node.NavigateUrl = Url;

			string cmd = "select xllxbh,xllxmc from t_xllx where jylxbh = " + type.ToString ();
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				AuditCreateNode0(r["xllxbh"].ToString (),r["xllxmc"].ToString (),Frame,"audit/zy_manage.aspx",node);//　加入所有根结点以下的结点　												
		}

		public void AuditCreateNode0(string f_key,string f_text, string Frame,string Url,TreeNode parentnode)
		{
			TreeNode tempnode = CreateOneNode (f_key,f_text,Frame,Url,parentnode,true);

			string cmd = "select zybh,zymc + '(' + t_school.mc + ')' as zymc  from t_zyjs,t_school where t_zyjs.schoolbh=t_school.bh and xllxbh=" + f_key + " order by t_school.bh";
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				AuditCreateNode1(r["zybh"].ToString (),r["zymc"].ToString (),Frame,"audit/xk_manage.aspx",tempnode);//　加入所有根结点以下的结点　												
		}

		public void AuditCreateNode1(string f_key,string f_text, string Frame,string Url,TreeNode parentnode)
		{
			TreeNode tempnode = CreateOneNode (f_key,f_text,Frame,Url,parentnode,false);

			string cmd = "select jxglbh,jxglxkmc from t_jxgl where zybh=" + f_key;
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				AuditCreateNode2(r["jxglbh"].ToString (),r["jxglxkmc"].ToString (),Frame,"audit/work_manage.aspx",tempnode);//　加入所有根结点以下的结点　												
		}

		public void AuditCreateNode2(string f_key,string f_text, string Frame,string Url,TreeNode parentnode)
		{
			TreeNode tempnode = CreateOneNode (f_key,f_text,Frame,Url,parentnode,false);

			string cmd = "select zybh,zymc from t_zygl where jxglbh=" + f_key;
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				CreateOneNode(r["zybh"].ToString (),r["zymc"].ToString (),Frame,"",tempnode,false);//　加入所有根结点以下的结点　
				
		}

		public void  StorageBindTreeView(string Frame,string Url,TreeView TreeView1)
		{
			//TreeView1.Nodes.Clear(); // 清空树
			TreeNode root = TreeView1.Nodes[0];
			root.Text="课件库维护"; // 给节点绑定显示值
			root.NodeData="root"; // 给节点绑定key值
			root.Expanded=true;//　默认根结点为展开
			root.Type = "root";
			if (Frame != "")
				root.Target = Frame;
			if (Url != "")
				root.NavigateUrl = Url;
/*
			string cmd = "select storageid,st_name from t_st";
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				StorageCreateNode3(r["storageid"].ToString (),r["st_name"].ToString (),Frame,"topic_manage.aspx",root);
				*/
		}

		public void  StorageBindOneTreeView(string Frame,string Url,TreeView TreeView1,string kjid)
		{
			//TreeView1.Nodes.Clear(); // 清空树
			TreeNode root = TreeView1.Nodes[0];
			root.Text="单一课件维护"; // 给节点绑定显示值
			root.NodeData="root"; // 给节点绑定key值
			root.Expanded=true;//　默认根结点为展开
			root.Type = "root";
			//if (Frame != "")
			//	root.Target = Frame;
			//if (Url != "")
			//	root.NavigateUrl = Url;

			string cmd = "select storageid,st_name from t_st_storage where storageid=" + kjid;
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				StorageCreateNode3(r["storageid"].ToString (),r["st_name"].ToString (),Frame,"topic_manage.aspx",root);
		}
			
		/// <summary>
		/// 获得包含在DataSet对象的映谢表集合中的index为0的映谢表
		/// </summary>
		/// <param name="str_Sql">Select-SQL语句</param>
		public DataTable GetTable(string str_Sql)
		{
			DataSet ds = Fill(str_Sql);
			return ds.Tables[0];
		}
		/// <summary>
		/// 建立DataSet对象,用记录填充或构架(如果必要)DataSet对象,DataSet即是数据在内存的缓存
		/// </summary>
		/// <param name="str_Sql">打开表Sql语句</param>
		public DataSet Fill(string str_Sql)
		{  	
			SqlDataAdapter myAdapter2 = new SqlDataAdapter(str_Sql,myCn);
			DataSet ds = new DataSet();
			myAdapter2.Fill(ds);
			myAdapter2.Dispose ();
			return ds;
		}

		public  string ExecGenExamRecord (string proc,string input1,string input2)
		{
			SqlCommand myCmd = new SqlCommand(proc,myCn);
			myCmd.CommandType = CommandType.StoredProcedure;
			SqlParameter sampParm = myCmd.Parameters.Add("RETURN_VALUE", SqlDbType.Int);
			sampParm.Direction = ParameterDirection.ReturnValue;

			sampParm = myCmd.Parameters.Add("@memid", SqlDbType.NVarChar, 20);
			sampParm.Value = input1;

			sampParm = myCmd.Parameters.Add("@kjbh", SqlDbType.NVarChar, 12);
			sampParm.Value = input2;

			sampParm = myCmd.Parameters.Add("@pass", SqlDbType.NVarChar, 1);
			sampParm.Direction = ParameterDirection.Output;
			try
			{
				SqlDataReader sampReader = myCmd.ExecuteReader();
				if ((int) myCmd.Parameters["RETURN_VALUE"].Value == 0)
				{
					sampReader.Close ();
					return (string) myCmd.Parameters["@pass"].Value;
				}
				else
				{
					sampReader.Close ();
					return "自动评卷失败，请与管理员联系!";
				}

			}
			catch (SqlException e)
			{
				throw new Exception (e.Message);
			}
			finally
			{
				myCmd.Dispose ();
			}
		}

		public  bool ExecProcJudgeIp (string proc,string ip)
		{
			SqlCommand myCmd = new SqlCommand(proc,myCn);
			myCmd.CommandType = CommandType.StoredProcedure;
			SqlParameter sampParm = myCmd.Parameters.Add("RETURN_VALUE", SqlDbType.Int);
			sampParm.Direction = ParameterDirection.ReturnValue;

			sampParm = myCmd.Parameters.Add("@ip", SqlDbType.NVarChar, 20);
			sampParm.Value = ip;
		
			try
			{
				SqlDataReader sampReader = myCmd.ExecuteReader();
				if ((int) myCmd.Parameters["RETURN_VALUE"].Value == 0)
				{
					sampReader.Close ();
					return false;
				}
				else
				{
					sampReader.Close ();
					return true;
				}

			}
			catch (SqlException e)
			{
				throw new Exception (e.Message);
			}
			finally
			{
				myCmd.Dispose ();
			}
		}
	}
}